/* eslint-disable max-lines */
/* eslint-disable no-unused-vars */
import { DELAY_BEFORE_EMITTING_TIME } from '@app/constants/socket-manager';
import { GameManager } from '@app/game-manager/game-manager.service';
import { GameService } from '@app/game/game.service';
import { GameEvents } from '@common/game-events';
import { ValidateAttemptService } from '@app/validate-attempt/validate-attempt.service';
import { Attempt } from '@common/attempt';
import { Authors, Chat, SystemMessage } from '@common/chat';
import { GameRoom } from '@common/game-room';
import { Difference, Game } from '@common/games';
import { Player } from '@common/player';
import { PlayerInfo } from '@common/player-info';
import { PlayerRanking } from '@common/player-ranking';
import { EndGameInfo } from '@common/end-game-info';
import { RoomId } from '@common/room-id';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'api' })
@Injectable()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;

    private rooms: RoomId[];
    private pendingGames: RoomId[];
    private pendingLimitedGame: string;

    // eslint-disable-next-line max-params
    constructor(
        private readonly logger: Logger,
        private validateAttemptService: ValidateAttemptService,
        private gameService: GameService,
        private gameManager: GameManager,
    ) {
        this.rooms = [];
        this.pendingGames = [];
        this.pendingLimitedGame = '';
    }

    @SubscribeMessage(GameEvents.CreatedGame)
    createdGame(socket: Socket): void {
        this.server.emit(GameEvents.ModifiedDatabase);
    }

    @SubscribeMessage(GameEvents.DeleteGame)
    async deleteGame(socket: Socket, id: number): Promise<void> {
        if (await this.gameService.deleteGame(id, this.rooms, this.pendingGames)) {
            this.server.emit(GameEvents.DeletedGame, id);
            this.server.emit(GameEvents.ModifiedDatabase);
        } else {
            socket.emit(GameEvents.FailedDelete);
        }
    }

    @SubscribeMessage(GameEvents.DeleteGames)
    async deleteGames(socket: Socket): Promise<void> {
        await this.gameService
            .deleteGames(this.rooms, this.pendingGames)
            .then((gameIds: number[]) => {
                gameIds.forEach((deletedID) => {
                    this.server.emit(GameEvents.DeletedGame, deletedID);
                });
                this.server.emit(GameEvents.ModifiedDatabase);
            })
            .catch(() => {
                socket.emit(GameEvents.FailedDeleteAll);
            });
    }

    @SubscribeMessage(GameEvents.ResetGame)
    async resetGame(socket: Socket, id: number): Promise<void> {
        await this.gameService
            .resetGame(id)
            .then(() => this.server.emit(GameEvents.ModifiedDatabase))
            .catch(() => this.server.emit(GameEvents.FailedReset));
    }

    @SubscribeMessage(GameEvents.ResetGames)
    async resetGames(socket: Socket): Promise<void> {
        await this.gameService
            .resetGames()
            .then(() => {
                this.server.emit(GameEvents.ModifiedDatabase);
            })
            .catch((error) => {
                socket.emit(GameEvents.FailedResetAll);
            });
    }

    @SubscribeMessage(GameEvents.SetValidationData)
    setValidationData(socket: Socket, id: number): void {
        this.validateAttemptService.setGameData(id);
    }

    @SubscribeMessage(GameEvents.ValidateAttempt)
    validateAttempt(socket: Socket, attempt: Attempt): void {
        const game: GameRoom = this.gameManager.findGameRoom(socket.id);
        const attemptValidation = this.checkAttempt(attempt, game);
        const gameRoom = [...socket.rooms][1];
        if (game.isLimitedTime) {
            this.validateLimitedGameAttempt(socket, game, attemptValidation);
            return;
        }
        if (gameRoom !== undefined && attemptValidation !== undefined) {
            this.multiplayerValidAttempt(socket, game, attemptValidation);
            return;
        }
        socket.emit(GameEvents.Validation, { difference: attemptValidation, playerId: socket.id });
        if (attemptValidation !== undefined) {
            this.soloValidAttempt(socket, game, attemptValidation);
            return;
        }
        this.sendErrorMessage(socket, game);
    }

    @SubscribeMessage(GameEvents.SetImages)
    setImages(socket: Socket, gameId: number): void {
        const game: Game = this.gameService.getGame(gameId);
        socket.emit(GameEvents.Images, {
            original: this.gameService.getImageData(game.originalImage),
            modified: this.gameService.getImageData(game.modifiedImage),
            differenceNumber: 0,
        });
    }

    @SubscribeMessage(GameEvents.GetPendingRooms)
    getActiveRooms(socket: Socket): void {
        socket.emit(GameEvents.UpdatedPendingRooms, this.pendingGames);
    }

    @SubscribeMessage(GameEvents.GameChat)
    sendMessage(socket: Socket, message: Chat): void {
        this.server.to(this.gameManager.findGameRoom(socket.id).roomId.stringFormat).emit(GameEvents.MessageSent, message);
    }

    @SubscribeMessage(GameEvents.SendNameWaitingList)
    sendNameWaitingList(socket: Socket, playerName: string): void {
        this.server.to(this.pendingGames.find((room) => room.stringFormat === [...socket.rooms][1]).hostId).emit(GameEvents.AddedNameHostList, {
            name: playerName,
            socketId: socket.id,
        });
    }

    @SubscribeMessage(GameEvents.RejectPlayer)
    rejectPlayer(socket: Socket, socketId: string): void {
        this.server.to(socketId).emit(GameEvents.PlayerDecision, '');
    }

    @SubscribeMessage(GameEvents.AcceptPlayer)
    acceptPlayer(socket: Socket, socketId: string): void {
        const roomName: string = [...socket.rooms][1];
        this.server.to(roomName).emit(GameEvents.PlayerDecision, socketId);
        this.pendingGames.splice(
            this.pendingGames.findIndex((pendingGame) => pendingGame.stringFormat === roomName),
            1,
        );
        this.gameManager.addGuest(this.gameManager.findGameRoom(socket.id), socketId);
        this.server.to('select').emit(GameEvents.RoomClosed, roomName);
    }

    @SubscribeMessage(GameEvents.JoinRoom)
    joinRoom(socket: Socket, roomName: string): void {
        socket.join(roomName);
    }

    @SubscribeMessage(GameEvents.JoinLimitedRoom)
    joinLimitedRoom(socket: Socket, playerName: string): void {
        if (this.pendingLimitedGame) {
            socket.join(this.pendingLimitedGame);
            const game: GameRoom = this.gameManager.findGameRoom(this.pendingLimitedGame);
            this.gameManager.addGuest(game, socket.id);
            this.gameManager.addPlayerName(game, socket.id, playerName);
            this.setLimitedGameMode(socket);
            this.server.to(this.pendingLimitedGame).emit(GameEvents.RoomJoined);
            this.pendingLimitedGame = '';
            return;
        }
        const roomId = {
            gameId: 0,
            roomNumber: 0,
            stringFormat: 'limited' + ' ' + socket.id,
            hostId: socket.id,
        };
        this.pendingLimitedGame = roomId.stringFormat;
        this.rooms.push(roomId);
        this.gameManager.createGame(roomId, 0, false);
        this.gameManager.addPlayerName(this.gameManager.findGameRoom(this.pendingLimitedGame), socket.id, playerName);
        socket.join(roomId.stringFormat);
        socket.emit(GameEvents.LimitedGameId, 0);
    }

    @SubscribeMessage(GameEvents.CreateRoom)
    createRoom(socket: Socket, gameId: number): void {
        const roomNumber = this.findLowestAvailableRoomIndex(
            this.rooms.filter((room) => {
                return room.gameId === gameId;
            }),
        );
        const roomId = {
            gameId,
            roomNumber,
            stringFormat: gameId + ' ' + roomNumber,
            hostId: socket.id,
        };
        this.rooms.push(roomId);
        this.pendingGames.push(roomId);
        this.gameManager.createGame(roomId, this.gameService.getGame(gameId).differenceImage.length, false);
        socket.join(roomId.stringFormat);
        this.server.to('select').emit(GameEvents.RoomCreated, roomId);
    }

    @SubscribeMessage(GameEvents.CreateSolo)
    createSoloGame(socket: Socket, gameId: number): void {
        const roomId: RoomId = { gameId, roomNumber: 0, stringFormat: socket.id, hostId: socket.id };
        this.rooms.push(roomId);
        this.gameManager.createGame(roomId, this.gameService.getGame(gameId).differenceImage.length, false);
    }

    @SubscribeMessage(GameEvents.DeleteSolo)
    deleteSoloGame(socket: Socket): void {
        this.removeRoom(socket.id);
    }

    @SubscribeMessage(GameEvents.SetLimitedGameMode)
    setLimitedGameMode(socket: Socket): void {
        const game: GameRoom = this.gameManager.findGameRoom(socket.id);
        this.gameManager.goToNextGame(game, this.gameService.getNextLimitedGame(game));
        this.gameManager.setGameMode(game, true);
        if (game.gameIds[0] !== undefined) {
            this.server.to(game.roomId.stringFormat).emit('limitedGameId', game.gameIds[0]);
            return;
        }
        this.endLimitedGame(game, 0, true);
    }

    @SubscribeMessage(GameEvents.LeaveRoom)
    leaveRoom(socket: Socket, roomName: string): void {
        if (roomName !== 'gameRoom') socket.leave(roomName);
        else {
            roomName = [...socket.rooms][1];
            socket.leave(roomName);
            this.server.to(roomName).emit(GameEvents.ParticipantLeft, socket.id);
        }
    }

    @SubscribeMessage(GameEvents.AbandonMultiplayerRoom)
    abandonMultiplayerRoom(socket: Socket): void {
        const roomName: string = [...socket.rooms][1];
        const gameRoom: GameRoom = this.gameManager.findGameRoom(socket.id);
        const player: Player = this.gameManager.findOpponent(socket.id, gameRoom);
        if (this.rooms.find((room) => room.stringFormat === roomName)) {
            this.endMultiplayerClassicGame(socket, player.name, player.socketId);
        }
        this.leaveGameRoom(socket);
    }

    @SubscribeMessage(GameEvents.AbandonLimitedGameRoom)
    abandonLimitedGameRoom(socket: Socket): void {
        const gameRoom: GameRoom = this.gameManager.findGameRoom(socket.id);
        this.server.to(gameRoom.roomId.stringFormat).emit(GameEvents.ParticipantLeft, socket.id);
        socket.leave(gameRoom.roomId.stringFormat);
        this.leaveGameRoom(socket);
    }

    @SubscribeMessage(GameEvents.DeleteRoom)
    deleteRoom(socket: Socket): void {
        const roomName: string = [...socket.rooms][1];
        this.removeAndLeaveRoom(socket, roomName);
        this.server.to('select').emit(GameEvents.RoomClosed, roomName);
        this.server.to(roomName).emit(GameEvents.RoomDeleted);
    }

    @SubscribeMessage(GameEvents.LeaveGameRoom)
    leaveGameRoom(socket: Socket): void {
        const gameRoom = this.gameManager.findGameRoom(socket.id);
        if (!gameRoom) return;
        if (gameRoom.host.socketId === socket.id) {
            gameRoom.host.socketId = '';
        }
        if (gameRoom.guest.socketId === socket.id) {
            gameRoom.guest.socketId = '';
        }
        if (!gameRoom.guest.socketId && !gameRoom.host.socketId) {
            this.removeAndLeaveRoom(socket, gameRoom.roomId.stringFormat);
            return;
        }
        socket.leave(gameRoom.roomId.stringFormat);
    }

    @SubscribeMessage(GameEvents.PlayerName)
    playerName(socket: Socket, playerName: string): void {
        const roomName: string = [...socket.rooms][1];
        this.gameManager.addPlayerName(this.gameManager.findGameRoom(socket.id), socket.id, playerName);
        this.server.to(roomName).emit(GameEvents.OpponentName, { name: playerName, socketId: socket.id });
    }

    @SubscribeMessage(GameEvents.SendPlayerReady)
    sendPlayerReady(socket: Socket, playerInfo: PlayerInfo): void {
        const gameRoom = this.gameManager.findGameRoom(socket.id);
        this.gameManager.addPlayerName(gameRoom, socket.id, playerInfo.name);
        this.server.to(this.gameManager.findGameRoom(socket.id).roomId.stringFormat).emit(GameEvents.PlayerReady, playerInfo);
    }

    @SubscribeMessage(GameEvents.ClueUsed)
    clueUsed(socket: Socket): void {
        const gameRoom: GameRoom = this.gameManager.findGameRoom(socket.id);
        this.gameManager.clueUsed(gameRoom);
        if (this.gameManager.checkForLimitedGameEnd(gameRoom)) {
            gameRoom.gameStarted = false;
            this.endLimitedGame(gameRoom, gameRoom.gameIds.length - 1, false);
        }
    }

    @SubscribeMessage(GameEvents.StartGame)
    startGame(socket: Socket): void {
        const gameRoom: GameRoom = this.gameManager.findGameRoom(socket.id);
        gameRoom.gameStarted = true;
        if (!gameRoom.isLimitedTime) gameRoom.clock = 0;
    }

    @SubscribeMessage(GameEvents.PauseTimer)
    pauseTimer(socket: Socket): void {
        const gameRoom: GameRoom = this.gameManager.findGameRoom(socket.id);
        gameRoom.gameStarted = false;
    }

    @SubscribeMessage(GameEvents.LimitedSearchCancelled)
    limitedSearchCancelled(socket: Socket): void {
        this.removeAndLeaveRoom(socket, this.pendingLimitedGame);
        this.pendingLimitedGame = '';
    }

    afterInit(): void {
        setInterval(() => {
            this.emitTime();
        }, DELAY_BEFORE_EMITTING_TIME);
    }

    handleConnection(socket: Socket): void {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
        socket.emit(GameEvents.Hello, 'Hello World!');
    }

    handleDisconnect(socket: Socket): void {
        let roomName = '';
        this.pendingGames.forEach((pendingGame) => {
            if (pendingGame.hostId === socket.id) roomName = pendingGame.stringFormat;
        });
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
        if (roomName) {
            this.removeAndLeaveRoom(socket, roomName);
            this.server.to('select').emit(GameEvents.RoomClosed, roomName);
            this.server.to(roomName).emit(GameEvents.RoomDeleted);
            return;
        }
        const gameRoom = this.gameManager.findGameRoom(socket.id);
        if (gameRoom) {
            if (gameRoom.roomId.stringFormat === this.pendingLimitedGame) {
                this.limitedSearchCancelled(socket);
                return;
            }
            this.sendAbandonMessage(socket, gameRoom);
            if (!gameRoom.isLimitedTime) {
                const player: Player = this.gameManager.findOpponent(socket.id, gameRoom);
                this.endMultiplayerClassicGame(socket, player.name, player.socketId);
                this.leaveGameRoom(socket);
                return;
            }
            this.server.to(gameRoom.roomId.stringFormat).emit(GameEvents.ParticipantLeft, socket.id);
            this.leaveGameRoom(socket);
            return;
        }
        socket.broadcast.emit(GameEvents.ParticipantLeft, socket.id);
    }

    private validateLimitedGameAttempt(socket: Socket, game: GameRoom, attemptValidation: Difference): void {
        if (attemptValidation !== undefined) {
            this.gameManager.differenceFound(game);
            const nextGame: number = this.gameService.getNextLimitedGame(game);
            this.server.to(game.roomId.stringFormat).emit(GameEvents.Validation, { difference: attemptValidation, playerId: socket.id });
            if (nextGame === undefined) {
                this.endLimitedGame(game, game.gameIds.length, true);
                return;
            }
            this.gameManager.goToNextGame(game, nextGame);
            this.sendValidationMessage(socket, game);
            this.server.to(game.roomId.stringFormat).emit(GameEvents.ChangeGame, nextGame);
            return;
        }
        socket.emit(GameEvents.Validation, { difference: attemptValidation, playerId: socket.id });
        this.sendErrorMessage(socket, game);
    }

    private sendGlobalMessage(message: Chat): void {
        this.server.emit(GameEvents.MessageSent, message);
    }

    private checkAttempt(attempt: Attempt, game: GameRoom): Difference {
        this.validateAttemptService.setGameData(attempt.currentGameId);
        return this.validateAttemptService.validateAttempt(attempt, game.host.differencesFound.concat(game.guest.differencesFound));
    }

    private multiplayerValidAttempt(socket: Socket, game: GameRoom, attemptValidation: Difference): void {
        const gameRoom = [...socket.rooms][1];
        this.gameManager.updateDifferencesFound(game, socket.id, attemptValidation.differenceNumber);
        this.server.to(gameRoom).emit(GameEvents.Validation, { difference: attemptValidation, playerId: socket.id });
        this.sendValidationMessage(socket, game);
        this.manageGameEnd(socket, game);
    }

    private soloValidAttempt(socket: Socket, game: GameRoom, attemptValidation: Difference): void {
        this.gameManager.updateDifferencesFound(game, socket.id, attemptValidation.differenceNumber);
        this.sendValidationMessage(socket, game);
        this.manageGameEnd(socket, game);
    }

    private async winMultiplayerClassicGame(socket: Socket, playerName: string, socketId?: string): Promise<void> {
        const winnerRanking: PlayerRanking = await this.gameManager.getWinnerRanking(socket.id);
        if (this.isNewRecord(winnerRanking)) {
            this.sendGlobalMessage(this.gameManager.getNewHighScoreMessage(socket.id, false, winnerRanking));
            this.server.emit(GameEvents.ModifiedDatabase);
        }
        this.endMultiplayerClassicGame(socket, playerName, socketId, winnerRanking);
    }

    // eslint-disable-next-line max-params
    private endMultiplayerClassicGame(socket: Socket, playerName: string, socketId?: string, winnerRanking?: PlayerRanking): void {
        this.server
            .to(this.gameManager.findGameRoom(socket.id).roomId.stringFormat)
            .emit(
                GameEvents.PlayerWonGame,
                { socketId: socketId ? socketId : socket.id, name: playerName },
                { ranking: winnerRanking !== undefined ? winnerRanking : PlayerRanking.None, time: this.gameManager.getClockTime(socket.id) },
            );
    }

    private endLimitedGame(gameRoom: GameRoom, score: number, isMaxScore: boolean): void {
        gameRoom.gameStarted = false;
        this.server.to(gameRoom.roomId.stringFormat).emit(GameEvents.LimitedGameDone, score, isMaxScore);
    }

    private async manageGameEnd(socket: Socket, gameRoom: GameRoom): Promise<void> {
        const roomName: string = [...socket.rooms][1];
        if (roomName) {
            const player: string = this.gameManager.checkForClassicWin(gameRoom);
            if (player) {
                this.winMultiplayerClassicGame(socket, player);
                return;
            }
            if (this.gameManager.checkForClassicTie(gameRoom)) {
                this.server.to(roomName).emit(GameEvents.GameTied);
                this.removeAndLeaveRoom(socket, roomName);
                return;
            }
        }
        if (this.gameManager.checkForSoloWin(gameRoom)) {
            const winnerRanking: PlayerRanking = await this.gameManager.getWinnerRanking(socket.id);
            if (this.isNewRecord(winnerRanking)) {
                this.sendGlobalMessage(this.gameManager.getNewHighScoreMessage(socket.id, true, winnerRanking));
                this.server.emit(GameEvents.ModifiedDatabase);
            }
            socket.emit(GameEvents.SoloGameWon, { ranking: winnerRanking, time: gameRoom.clock });
            this.deleteSoloGame(socket);
        }
    }

    private isNewRecord(winnerRanking: PlayerRanking): boolean {
        return winnerRanking !== PlayerRanking.None && winnerRanking !== PlayerRanking.NotRecorded;
    }

    private sendValidationMessage(socket: Socket, gameRoom: GameRoom): void {
        const roomName: string = [...socket.rooms][1];
        this.sendMessage(socket, {
            author: Authors.System,
            socketId: socket.id,
            body: roomName
                ? SystemMessage.DifferenceFound + ' par ' + this.gameManager.findPlayerName(socket.id, gameRoom)
                : SystemMessage.DifferenceFound,
        });
    }

    private sendErrorMessage(socket: Socket, gameRoom: GameRoom): void {
        const roomName: string = [...socket.rooms][1];
        this.sendMessage(socket, {
            author: Authors.System,
            socketId: socket.id,
            body: roomName ? SystemMessage.Error + ' par ' + this.gameManager.findPlayerName(socket.id, gameRoom) : SystemMessage.Error,
        });
    }

    private sendAbandonMessage(socket: Socket, gameRoom: GameRoom): void {
        this.sendMessage(socket, {
            author: Authors.System,
            socketId: socket.id,
            body: this.gameManager.findPlayerName(socket.id, gameRoom) + SystemMessage.Abandon,
        });
    }

    private removeAndLeaveRoom(socket: Socket, roomName: string): void {
        this.removeRoom(roomName);
        socket.leave(roomName);
    }

    private findLowestAvailableRoomIndex(gameRooms: RoomId[]): number {
        let roomNumber = 0;
        if (gameRooms !== undefined) {
            roomNumber = gameRooms.length;
            for (let i = 0; i < gameRooms.length; i++) {
                if (
                    !gameRooms.find((room) => {
                        return room.roomNumber === i;
                    })
                ) {
                    roomNumber = i;
                    break;
                }
            }
        }
        return roomNumber;
    }

    private removeRoom(roomName: string): void {
        this.gameManager.removeGame(roomName);
        const pendingGamesIndex = this.pendingGames.findIndex((pendingGame) => pendingGame.stringFormat === roomName);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (pendingGamesIndex !== -1) this.pendingGames.splice(pendingGamesIndex, 1);

        const roomIndex = this.rooms.findIndex((room) => room.stringFormat === roomName);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (roomIndex !== -1) {
            const roomId: number = this.rooms.splice(roomIndex, 1)[0].gameId;
        }
        this.gameService.updateTempDeletedGames(this.rooms, this.pendingGames);
    }

    private emitTime(): void {
        const gameRooms: GameRoom[] = this.gameManager.getGameRooms();
        gameRooms.forEach((gameRoom) => {
            if (gameRoom.gameStarted && gameRoom.isLimitedTime) {
                gameRoom.clock--;
                if (this.gameManager.checkForLimitedGameEnd(gameRoom)) {
                    this.endLimitedGame(gameRoom, gameRoom.gameIds.length - 1, false);
                    return;
                }
                this.server.to(gameRoom.roomId.stringFormat).emit(GameEvents.Timer, gameRoom.clock);
                return;
            }
            if (gameRoom.gameStarted) this.server.to(gameRoom.roomId.stringFormat).emit(GameEvents.Timer, gameRoom.clock++);
        });
    }
}
