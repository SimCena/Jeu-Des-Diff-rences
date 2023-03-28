/* eslint-disable max-lines */
import { Injectable } from '@angular/core';
import { Attempt } from '@common/attempt';
import { Chat } from '@common/chat';
import { AttemptResponse, Images } from '@common/games';
import { PlayerInfo } from '@common/player-info';
import { EndGameInfo } from '@common/end-game-info';
import { RoomId } from '@common/room-id';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { GameEvents } from '@common/game-events';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    socket: Socket;
    pendingRooms: RoomId[];
    roomsReceived: boolean;

    constructor() {
        this.pendingRooms = [];
        this.roomsReceived = true;
    }

    on<T>(event: string, action: (data: T) => void): void {
        this.socket.on(event, action);
    }

    send<T>(event: string, data?: T): void {
        if (typeof data !== 'undefined') {
            this.socket.emit(event, data);
        } else {
            this.socket.emit(event);
        }
    }

    isSocketAlive(): boolean {
        return this.socket && this.socket.connected;
    }

    getSocketId(): string {
        return this.socket.id;
    }

    connect(): void {
        this.roomsReceived = false;
        this.socket = io(environment.serverUrl, { transports: ['websocket'] });
        this.updateActiveRooms();
    }

    createdGame(): void {
        this.send(GameEvents.CreatedGame);
    }

    deleteGame(id: number): void {
        this.send(GameEvents.DeleteGame, id);
    }

    deleteGames(): void {
        this.send(GameEvents.DeleteGames);
    }

    resetGame(id: number): void {
        this.send(GameEvents.ResetGame, id);
    }

    resetGames(): void {
        this.send(GameEvents.ResetGames);
    }

    requestActiveRooms(): void {
        this.send(GameEvents.GetPendingRooms);
    }

    updateActiveRooms(): void {
        this.on(GameEvents.UpdatedPendingRooms, (updatedActiveRooms) => {
            this.pendingRooms = updatedActiveRooms as RoomId[];
            this.roomsReceived = true;
        });
    }

    disconnect(): void {
        this.socket.disconnect();
    }

    setValidationData(gameId: number): void {
        this.send(GameEvents.SetValidationData, gameId);
    }

    validateAttempt(attempt: Attempt): void {
        this.send(GameEvents.ValidateAttempt, attempt);
    }

    sendMessage(message: Chat): void {
        const date = new Date();
        message.time =
            date.getHours().toLocaleString('en-us', { minimumIntegerDigits: 2 }) +
            ':' +
            date.getMinutes().toLocaleString('en-us', { minimumIntegerDigits: 2 }) +
            ':' +
            date.getSeconds().toLocaleString('en-us', { minimumIntegerDigits: 2 });
        this.send(GameEvents.GameChat, message);
    }

    setImages(gameId: number): void {
        this.send(GameEvents.SetImages, gameId);
    }

    createSoloGame(gameId: number): void {
        this.send(GameEvents.CreateSolo, gameId);
    }

    deleteSoloGame(): void {
        this.send(GameEvents.DeleteSolo);
    }

    createNewGame(id: number): void {
        this.setValidationData(id);
        this.setImages(id);
    }

    joinRoom(roomName: string): void {
        this.send(GameEvents.JoinRoom, roomName);
    }

    joinLimitedRoom(playerName: string): void {
        this.send(GameEvents.JoinLimitedRoom, playerName);
    }

    leaveRoom(roomName: string): void {
        this.send(GameEvents.LeaveRoom, roomName);
    }

    abandonMultiplayerRoom(): void {
        this.send(GameEvents.AbandonMultiplayerRoom);
    }

    abandonLimitedGameRoom(): void {
        this.send(GameEvents.AbandonLimitedGameRoom);
    }

    deleteRoom(): void {
        this.send(GameEvents.DeleteRoom);
    }

    leaveGameRoom(): void {
        this.send(GameEvents.LeaveGameRoom);
    }

    createRoom(gameId: number): void {
        this.send(GameEvents.CreateRoom, gameId);
    }

    sendNameWaitingList(playerName: string | void): void {
        this.send(GameEvents.SendNameWaitingList, playerName);
    }

    rejectPlayer(socketId: string): void {
        this.send(GameEvents.RejectPlayer, socketId);
    }

    acceptPlayer(socketId: string): void {
        this.send(GameEvents.AcceptPlayer, socketId);
    }

    sendPlayerName(name: string): void {
        this.send(GameEvents.PlayerName, name);
    }

    sendPlayerReady(playerInfo: PlayerInfo): void {
        this.send(GameEvents.SendPlayerReady, playerInfo);
    }

    clueUsed(): void {
        this.send(GameEvents.ClueUsed);
    }

    setLimitedGameMode(): void {
        this.send(GameEvents.SetLimitedGameMode);
    }

    startGame(): void {
        this.send(GameEvents.StartGame);
    }

    pauseTimer(): void {
        this.send(GameEvents.PauseTimer);
    }

    limitedSearchCancelled(): void {
        this.send(GameEvents.LimitedSearchCancelled);
    }

    subscribeLimitedGameId(callback: (response: number) => void): void {
        this.on(GameEvents.LimitedGameId, callback);
    }

    subscribeOpponentReady(callback: (response: PlayerInfo) => void): void {
        this.on(GameEvents.PlayerReady, callback);
    }

    subscribeDeletedGame(callback: (id: number) => void): void {
        this.on(GameEvents.DeletedGame, callback);
    }

    subscribeFailedDelete(callback: () => void): void {
        this.on(GameEvents.FailedDelete, callback);
    }

    subscribeFailedDeleteAll(callback: () => void): void {
        this.on(GameEvents.FailedDeleteAll, callback);
    }

    subscribeFailedReset(callback: () => void): void {
        this.on(GameEvents.FailedReset, callback);
    }

    subscribeFailedResetAll(callback: () => void): void {
        this.on(GameEvents.FailedResetAll, callback);
    }

    subscribeModifiedDatabase(callback: () => void): void {
        this.on(GameEvents.ModifiedDatabase, callback);
    }

    subscribeTimer(callback: (clock: number) => void): void {
        this.on(GameEvents.Timer, callback);
    }

    subscribeValidation(callback: (response: AttemptResponse) => void): void {
        this.on(GameEvents.Validation, callback);
    }

    subscribeImages(callback: (images: Images) => void): void {
        this.on(GameEvents.Images, callback);
    }

    subscribeRoomCreated(callback: (roomId: RoomId) => void): void {
        this.on(GameEvents.RoomCreated, callback);
    }

    subscribeRoomClosed(callback: (roomId: string) => void): void {
        this.on(GameEvents.RoomClosed, callback);
    }

    subscribeRoomDeleted(callback: () => void): void {
        this.on(GameEvents.RoomDeleted, callback);
    }

    subscribeAddedNameHostList(callback: (playerInfo: PlayerInfo) => void): void {
        this.on(GameEvents.AddedNameHostList, callback);
    }

    subscribePlayerDecision(callback: (socketId: string) => void): void {
        this.on(GameEvents.PlayerDecision, callback);
    }

    subscribeParticipantLeft(callback: (socketId: string) => void): void {
        this.on(GameEvents.ParticipantLeft, callback);
    }

    subscribeAbandonedGame(callback: (playerInfo: PlayerInfo) => void): void {
        this.on(GameEvents.AbandonedGame, callback);
    }

    subscribePlayerWonGame(callback: (playerInfo: PlayerInfo, endGameInfo: EndGameInfo) => void): void {
        this.socket.on(GameEvents.PlayerWonGame, callback);
    }

    subscribeMessageSent(callback: (message: Chat) => void): void {
        const newCallback = (message: Chat) => {
            if (!message.time) {
                const date = new Date();
                message.time =
                    date.getHours().toLocaleString('en-us', { minimumIntegerDigits: 2 }) +
                    ':' +
                    date.getMinutes().toLocaleString('en-us', { minimumIntegerDigits: 2 }) +
                    ':' +
                    date.getSeconds().toLocaleString('en-us', { minimumIntegerDigits: 2 });
            }
            callback(message);
        };
        this.on(GameEvents.MessageSent, newCallback);
    }

    subscribeOpponentName(callback: (playerInfo: PlayerInfo) => void): void {
        this.on(GameEvents.OpponentName, callback);
    }

    subscribeSoloGameWon(callback: (endGameInfo: EndGameInfo) => void): void {
        this.on(GameEvents.SoloGameWon, callback);
    }

    subscribeGameTied(callback: (playerInfo: PlayerInfo) => void): void {
        this.on(GameEvents.GameTied, callback);
    }

    subscribeChangeGame(callback: (game: number) => void): void {
        this.on(GameEvents.ChangeGame, callback);
    }

    subscribeLimitedGameDone(callback: (score: number, isMaxScore: boolean) => void): void {
        this.socket.on(GameEvents.LimitedGameDone, callback);
    }

    subscribeRoomJoined(callback: () => void): void {
        this.on(GameEvents.RoomJoined, callback);
    }

    unsubscribeBaseSocketFeatures(): void {
        this.socket.off(GameEvents.Images);
        this.socket.off(GameEvents.Timer);
    }

    unsubscribeMessageSent(): void {
        this.socket.off(GameEvents.MessageSent);
    }

    unsubscribeHostUpdates(): void {
        this.socket.off(GameEvents.AddedNameHostList);
        this.socket.off(GameEvents.ParticipantLeft);
        this.socket.off(GameEvents.DeletedGame);
    }

    unsubscribeParticipantUpdates(): void {
        this.socket.off(GameEvents.PlayerDecision);
        this.socket.off(GameEvents.RoomDeleted);
        this.socket.off(GameEvents.DeletedGame);
    }

    unsubscribeGameSocketFeatures(): void {
        this.socket.off(GameEvents.Validation);
        this.socket.off(GameEvents.AbandonedGame);
        this.unsubscribeParticipantLeft();
        this.socket.off(GameEvents.PlayerWonGame);
        this.socket.off(GameEvents.GameTied);
        this.socket.off(GameEvents.SoloGameWon);
    }

    unsubscribeAdministration(): void {
        this.socket.off(GameEvents.FailedReset);
        this.socket.off(GameEvents.FailedResetAll);
        this.socket.off(GameEvents.FailedDeleteAll);
        this.socket.off(GameEvents.FailedDelete);
    }

    unsubscribeTimer(): void {
        this.socket.off(GameEvents.Timer);
    }

    unsubscribeGameViewerUpdates(): void {
        this.socket.off(GameEvents.ModifiedDatabase);
    }

    unsubscribeOpponentName(): void {
        this.socket.off(GameEvents.OpponentName);
    }

    unsubscribeParticipantLeft(): void {
        this.socket.off(GameEvents.ParticipantLeft);
    }

    unsubscribeLimitedGameEvents(): void {
        this.socket.off(GameEvents.Validation);
        this.socket.off(GameEvents.ChangeGame);
        this.socket.off(GameEvents.LimitedGameDone);
        this.socket.off(GameEvents.Images);
        this.socket.off(GameEvents.PlayerReady);
        this.socket.off(GameEvents.LimitedGameId);
    }

    unsubscribeLimitedWaitingRoomEvents(): void {
        this.socket.off(GameEvents.RoomJoined);
        this.socket.off(GameEvents.DeletedGame);
    }
}
