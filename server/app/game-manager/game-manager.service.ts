/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TWO_MINUTES_IN_SECONDS } from '@app/constants/game';
import { GameConstantsController } from '@app/game-constants/game-constants.controller';
import { GameRoom } from '@common/game-room';
import { Player } from '@common/player';
import { RoomId } from '@common/room-id';
import { Injectable } from '@nestjs/common';
import { GameService } from '@app/game/game.service';
import { Game, Ranking } from '@common/games';
import { PlayerRanking } from '@common/player-ranking';
import { Authors, Chat } from '@common/chat';

@Injectable()
export class GameManager {
    private gameRooms: GameRoom[];

    private readonly positionMap: Map<PlayerRanking, string> = new Map<PlayerRanking, string>([
        [PlayerRanking.First, '1ère'],
        [PlayerRanking.Second, '2e'],
        [PlayerRanking.Third, '3e'],
    ]);

    constructor(private gameConstantsController: GameConstantsController, private gameService: GameService) {
        this.gameRooms = [];
    }

    getGameRooms(): GameRoom[] {
        return this.gameRooms;
    }

    findGameRoom(socketId: string): GameRoom {
        return this.gameRooms.find((room) => {
            return room.host.socketId === socketId || room.guest.socketId === socketId || room.roomId.stringFormat === socketId;
        });
    }

    findPlayerName(socketId: string, gameRoom: GameRoom): string {
        if (gameRoom.host.socketId === socketId) {
            return gameRoom.host.name;
        }
        return gameRoom.guest.name;
    }

    findOpponent(socketId: string, gameRoom: GameRoom): Player {
        if (gameRoom.host.socketId !== socketId) {
            return gameRoom.host;
        }
        return gameRoom.guest;
    }

    clueUsed(gameRoom: GameRoom): void {
        if (gameRoom.isLimitedTime) {
            this.updateTime(gameRoom, -gameRoom.constants.hintUsedTime);
            return;
        }
        this.updateTime(gameRoom, gameRoom.constants.hintUsedTime);
    }

    differenceFound(gameRoom: GameRoom): void {
        this.updateTime(gameRoom, gameRoom.constants.goodGuessTime);
    }

    createGame(roomId: RoomId, numberDifferences: number, gameStarted: boolean): void {
        this.gameRooms.push({
            roomId,
            host: { socketId: roomId.hostId, name: '', differencesFound: [] },
            guest: { socketId: '', name: '', differencesFound: [] },
            numberDifferences,
            clock: 0,
            gameStarted,
            constants: this.gameConstantsController.getGameConstants(),
            isLimitedTime: false,
            gameIds: [],
        });
    }

    setGameMode(gameRoom: GameRoom, limitedTime: boolean): void {
        gameRoom.isLimitedTime = limitedTime;
        if (limitedTime) {
            gameRoom.clock = gameRoom.constants.initialTime;
        }
    }

    addGuest(gameRoom: GameRoom, socketId: string): void {
        gameRoom.guest.socketId = socketId;
    }

    addPlayerName(gameRoom: GameRoom, socketId: string, name: string): void {
        if (gameRoom.roomId.stringFormat === socketId && !gameRoom.isLimitedTime) {
            gameRoom.gameStarted = true;
            gameRoom.clock = 0;
        }
        if (socketId === gameRoom.host.socketId) {
            gameRoom.host.name = name;
            return;
        }
        gameRoom.guest.name = name;
    }

    updateTime(gameRoom: GameRoom, incrementation: number): void {
        gameRoom.clock += incrementation;
        if (gameRoom.isLimitedTime && gameRoom.clock > TWO_MINUTES_IN_SECONDS) {
            gameRoom.clock = TWO_MINUTES_IN_SECONDS;
        }
    }

    updateDifferencesFound(gameRoom: GameRoom, socketId: string, difference: number): void {
        if (socketId === gameRoom.host.socketId) {
            gameRoom.host.differencesFound.push(difference);
        }
        if (socketId === gameRoom.guest.socketId) {
            gameRoom.guest.differencesFound.push(difference);
        }
    }

    goToNextGame(gameRoom: GameRoom, gameId: number): void {
        gameRoom.roomId.gameId = gameId;
        gameRoom.gameIds.push(gameId);
    }

    checkForSoloWin(gameRoom: GameRoom): boolean {
        return gameRoom.host.differencesFound.length === gameRoom.numberDifferences;
    }

    checkForClassicWin(gameRoom: GameRoom): string {
        if (gameRoom.host.differencesFound.length > gameRoom.numberDifferences / 2) {
            return gameRoom.host.name;
        }
        if (gameRoom.guest.differencesFound.length > gameRoom.numberDifferences / 2) {
            return gameRoom.guest.name;
        }
        return undefined;
    }

    checkForClassicTie(gameRoom: GameRoom): boolean {
        return gameRoom.host.differencesFound.length + gameRoom.guest.differencesFound.length === gameRoom.numberDifferences;
    }

    checkForLimitedGameEnd(gameRoom: GameRoom): boolean {
        return gameRoom.isLimitedTime && gameRoom.clock <= 0;
    }

    removeGame(socketId: string): void {
        const index: number = this.gameRooms.findIndex(
            (room) => room.host.socketId === socketId || room.guest.socketId === socketId || room.roomId.stringFormat === socketId,
        );
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (index !== -1) {
            this.gameRooms.splice(index, 1);
        }
    }

    getClockTime(socketId: string): number {
        return this.findGameRoom(socketId).clock;
    }

    getNewHighScoreMessage(socketId: string, isSolo: boolean, ranking: PlayerRanking): Chat {
        const currentGame: Game = this.gameService.getGame(this.findGameRoom(socketId).roomId.gameId);
        return {
            time: this.getCurrentTime(),
            author: Authors.System,
            socketId: undefined,
            body: `${isSolo ? currentGame.solo[ranking].name : currentGame.multiplayer[ranking].name} obtient la ${this.positionMap.get(
                ranking,
            )} place dans les meilleurs temps du jeu « ${currentGame.name} » en ${isSolo ? 'solo' : 'un contre un'}`,
        };
    }

    async getWinnerRanking(socketId: string): Promise<PlayerRanking> {
        const gameRoom: GameRoom = this.findGameRoom(socketId);
        const currentGame: Game = Object.assign({}, this.gameService.getGame(gameRoom.roomId.gameId));
        const isSolo: boolean = gameRoom.roomId.stringFormat === socketId;
        const topScores: Ranking[] = isSolo ? [...currentGame.solo] : [...currentGame.multiplayer];

        const pos: number = this.updateTopScores(topScores, {
            name: this.determineScoreName(isSolo, gameRoom, socketId),
            time: gameRoom.clock,
        });

        this.updateGameScores(currentGame, topScores, isSolo);

        return new Promise<PlayerRanking>((resolve) => {
            this.gameService
                .updateGame(currentGame)
                .then(() => {
                    resolve(pos);
                })
                .catch(() => {
                    resolve(PlayerRanking.NotRecorded);
                });
        });
    }

    private sortTopScores(a: Ranking, b: Ranking): number {
        if (a.time < b.time) return -1;
        return 1;
    }

    private updateTopScores(topScores: Ranking[], newScore: Ranking): number {
        topScores.push(newScore);
        topScores.sort(this.sortTopScores);
        topScores.pop();
        return topScores.indexOf(newScore);
    }

    private updateGameScores(game: Game, scores: Ranking[], isSolo: boolean): void {
        if (isSolo) {
            game.solo = scores;
            return;
        }
        game.multiplayer = scores;
    }

    private determineScoreName(isSolo: boolean, gameRoom: GameRoom, socketId: string): string {
        return isSolo ? gameRoom.host.name : this.findPlayerName(socketId, gameRoom);
    }

    private getCurrentTime(): string {
        const date = new Date();
        return (
            date.getHours().toLocaleString('en-us', { minimumIntegerDigits: 2 }) +
            ':' +
            date.getMinutes().toLocaleString('en-us', { minimumIntegerDigits: 2 }) +
            ':' +
            date.getSeconds().toLocaleString('en-us', { minimumIntegerDigits: 2 })
        );
    }
}
