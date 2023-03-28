/* eslint-disable max-lines */
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Attempt } from '@common/attempt';
import { Chat } from '@common/chat';
import { GameEvents } from '@common/game-events';
import { PlayerInfo } from '@common/player-info';
import { RoomId } from '@common/room-id';
import { Socket } from 'socket.io-client';
import { ClockService } from './clock.service';
import { SocketService } from './socket.service';

@Injectable({
    providedIn: 'root',
})
class MockClocService extends ClockService {}

describe('SocketClientService', () => {
    let service: SocketService;
    let socket: Socket;

    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    function fakeCallBack(): () => void {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {};
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: ClockService,
                    useClass: MockClocService,
                },
            ],
        });
        service = TestBed.inject(SocketService);
        service.connect();
        socket = service['socket'];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should be connected if server is opened', () => {
        expect(socket.active).toBeTruthy();
    });

    describe('isSocketAlive', () => {
        it('should return true if socket is alive', () => {
            service.socket.connected = true;
            expect(service.isSocketAlive()).toBeTrue();
        });
        it('should return false if socket is not alive', () => {
            service.socket.connected = false;
            expect(service.isSocketAlive()).toBeFalse();
        });
    });

    describe('getSocketId', () => {
        it('should return correct socketId', () => {
            service['socket'].id = 'testId';
            expect(service.getSocketId()).toEqual('testId');
        });
    });

    it('setValidation should emit to server with correct arguments', () => {
        const spy = spyOn(service, 'send');
        service.setValidationData(0);
        expect(spy).toHaveBeenCalledWith('setValidationData', 0);
    });

    it('validateAttempt should emit to server with correct arguments', () => {
        const attempt: Attempt = {
            coords: {
                x: 0,
                y: 0,
            },
            currentGameId: 0,
        };
        const spy = spyOn(service, 'send');
        service.validateAttempt(attempt);
        expect(spy).toHaveBeenCalledWith('validateAttempt', attempt);
    });

    it('setImages should emit to server with correct arguments', () => {
        const spy = spyOn(service, 'send');
        service.setImages(0);
        expect(spy).toHaveBeenCalledWith('setImages', 0);
    });

    describe('disconnect', () => {
        it('should disconnect the socket when called', () => {
            const disconnectSpy = spyOn(service.socket, 'disconnect');
            service.disconnect();
            expect(disconnectSpy).toHaveBeenCalled();
        });
    });

    describe('on', () => {
        it('should call service.socket.on', () => {
            const onSpy = spyOn(service.socket, 'on');
            service.on('fakeEvent', fakeCallBack);
            expect(onSpy).toHaveBeenCalledWith('fakeEvent', fakeCallBack);
        });
    });

    describe('createNewGame', () => {
        it('should call the right methods', () => {
            const setValidationDataSpy = spyOn(service, 'setValidationData');
            const setImagesSpy = spyOn(service, 'setImages');
            service.createNewGame(2);
            expect(setValidationDataSpy).toHaveBeenCalledWith(2);
            expect(setImagesSpy).toHaveBeenCalledWith(2);
        });
    });

    describe('createRoom', () => {
        it('should send to server the right arguments', () => {
            const spy = spyOn(service, 'send');
            service.createRoom(0);
            expect(spy).toHaveBeenCalledWith('createRoom', 0);
        });
    });

    describe('createdGame', () => {
        it('should send a createdGame message', () => {
            const spy = spyOn(service, 'send');
            service.createdGame();
            expect(spy).toHaveBeenCalledWith('createdGame');
        });
    });

    describe('deleteGame', () => {
        it('should send a deleteGame message with the right game id', () => {
            const spy = spyOn(service, 'send');
            service.deleteGame(0);
            expect(spy).toHaveBeenCalledWith('deleteGame', 0);
        });
    });

    describe('deleteGames', () => {
        it('should send a deleteGames message', () => {
            const spy = spyOn(service, 'send');
            service.deleteGames();
            expect(spy).toHaveBeenCalledWith('deleteGames');
        });
    });

    describe('resetGame', () => {
        it('should send a resetGame message with the right game id', () => {
            const spy = spyOn(service, 'send');
            service.resetGame(0);
            expect(spy).toHaveBeenCalledWith('resetGame', 0);
        });
    });

    describe('resetGames', () => {
        it('should send a resetGames message', () => {
            const spy = spyOn(service, 'send');
            service.resetGames();
            expect(spy).toHaveBeenCalledWith('resetGames');
        });
    });

    describe('rejectPlayer', () => {
        it('should send to server the right arguments', () => {
            const spy = spyOn(service, 'send');
            service.rejectPlayer('socketId');
            expect(spy).toHaveBeenCalledWith('rejectPlayer', 'socketId');
        });
    });

    describe('acceptPlayer', () => {
        it('should send to server the right arguments', () => {
            const spy = spyOn(service, 'send');
            service.acceptPlayer('socketId');
            expect(spy).toHaveBeenCalledWith('acceptPlayer', 'socketId');
        });
    });

    describe('sendPlayerName', () => {
        it('should send to server the right arguments', () => {
            const spy = spyOn(service, 'send');
            service.sendPlayerName('test');
            expect(spy).toHaveBeenCalledWith('playerName', 'test');
        });
    });

    describe('createSoloGame', () => {
        it('should send to server the right arguments', () => {
            const spy = spyOn(service, 'send');
            service.createSoloGame(0);
            expect(spy).toHaveBeenCalledWith('createSolo', 0);
        });
    });

    describe('abandonMultiplayerRoom', () => {
        it('should send to server the right arguments', () => {
            const spy = spyOn(service, 'send');
            service.abandonMultiplayerRoom();
            expect(spy).toHaveBeenCalledWith('abandonMultiplayerRoom');
        });
    });

    describe('deleteRoom', () => {
        it('should send to server the right arguments', () => {
            const spy = spyOn(service, 'send');
            service.deleteRoom();
            expect(spy).toHaveBeenCalledWith('deleteRoom');
        });
    });

    describe('leaveGameRoom', () => {
        it('should send to server the right arguments', () => {
            const spy = spyOn(service, 'send');
            service.leaveGameRoom();
            expect(spy).toHaveBeenCalledWith('leaveGameRoom');
        });
    });

    describe('sendPlayerReady', () => {
        it('should send to server the right arguments', () => {
            const playerInfo: PlayerInfo = {
                name: 'nom',
                socketId: 'socketID',
            };
            const spy = spyOn(service, 'send');
            service.sendPlayerReady(playerInfo);
            expect(spy).toHaveBeenCalledWith('sendPlayerReady', playerInfo);
        });
    });

    describe('clueUsed', () => {
        it('should send a clues used message', () => {
            const spy = spyOn(service, 'send');
            service.clueUsed();
            expect(spy).toHaveBeenCalledWith('clueUsed');
        });
    });

    describe('setLimitedGameMode', () => {
        it('should send a clues used message', () => {
            const spy = spyOn(service, 'send');
            service.setLimitedGameMode();
            expect(spy).toHaveBeenCalledWith('setLimitedGameMode');
        });
    });

    describe('startGame', () => {
        it('should send a clues used message', () => {
            const spy = spyOn(service, 'send');
            service.startGame();
            expect(spy).toHaveBeenCalledWith('startGame');
        });
    });

    describe('pauseTimer', () => {
        it('should send a clues used message', () => {
            const spy = spyOn(service, 'send');
            service.pauseTimer();
            expect(spy).toHaveBeenCalledWith('pauseTimer');
        });
    });

    describe('limitedSearchCancelled', () => {
        it('should send a clues used message', () => {
            const spy = spyOn(service, 'send');
            service.limitedSearchCancelled();
            expect(spy).toHaveBeenCalledWith('limitedSearchCancelled');
        });
    });

    describe('subscribeLimitedGameId', () => {
        it('should call the on method with the right parameters', () => {
            const onSpy = spyOn(service, 'on');
            service.subscribeLimitedGameId(fakeCallBack);
            expect(onSpy).toHaveBeenCalledWith('limitedGameId', fakeCallBack);
        });
    });

    describe('subscribeOpponentReady', () => {
        it('should call the on method with the right parameters', () => {
            const onSpy = spyOn(service, 'on');
            service.subscribeOpponentReady(fakeCallBack);
            expect(onSpy).toHaveBeenCalledWith('playerReady', fakeCallBack);
        });
    });

    describe('updateActiveRooms', () => {
        it('should set pendingRooms in its callback', () => {
            service['pendingRooms'] = [];
            const room: RoomId = {
                hostId: 'simon',
                gameId: 0,
                roomNumber: 3,
                stringFormat: '0 3',
            };
            spyOn(service, 'on').and.callFake((event, callback) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return callback([room] as any);
            });
            service.updateActiveRooms();
            expect(service['pendingRooms']).toEqual([room]);
        });
    });

    describe('subscribeTimer', () => {
        it('should call the on method with the right parameters', () => {
            const onSpy = spyOn(service, 'on');
            service.subscribeTimer(fakeCallBack);
            expect(onSpy).toHaveBeenCalledWith('timer', fakeCallBack);
        });
    });

    describe('subscribeValidation', () => {
        it('should call the on method with the right parameters', () => {
            const onSpy = spyOn(service, 'on');
            service.subscribeValidation(fakeCallBack);
            expect(onSpy).toHaveBeenCalledWith('validation', fakeCallBack);
        });
    });

    describe('subscribeImages', () => {
        it('should call the on method with the right parameters', () => {
            const onSpy = spyOn(service, 'on');
            service.subscribeImages(fakeCallBack);
            expect(onSpy).toHaveBeenCalledWith('images', fakeCallBack);
        });
    });

    describe('subscribeAbandonedGame', () => {
        it('should call the on method with the right parameters', () => {
            const onSpy = spyOn(service, 'on');
            service.subscribeAbandonedGame(fakeCallBack);
            expect(onSpy).toHaveBeenCalledWith('abandonedGame', fakeCallBack);
        });
    });

    describe('subscribeMessageSent', () => {
        it('if time is not definite in message, should call getTime functions to set time of message', () => {
            const message: Chat = {
                author: 'simcena',
                socketId: 'simon',
                body: 'allo',
            };
            const spy = spyOn(Date.prototype, 'getMinutes').and.callThrough();
            spyOn(service, 'on').and.callFake((sentMessage, callback) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return callback(message as unknown as any);
            });
            service.subscribeMessageSent(() => {
                return;
            });
            expect(spy).toHaveBeenCalled();
        });
    });
    describe('subscribeOpponentReady', () => {
        it('should call the on method with the right parameters', () => {
            const onSpy = spyOn(service, 'on');
            service.subscribeOpponentReady(fakeCallBack);
            expect(onSpy).toHaveBeenCalledWith('playerReady', fakeCallBack);
        });
    });

    describe('subscribePlayerWonGame', () => {
        it('should call the on method with the right parameters', () => {
            const onSpy = spyOn(service.socket, 'on');
            service.subscribePlayerWonGame(fakeCallBack);
            expect(onSpy).toHaveBeenCalledWith('playerWonGame', fakeCallBack);
        });
    });

    describe('subscribeOpponentName', () => {
        it('should call the on method with the right parameters', () => {
            const onSpy = spyOn(service, 'on');
            service.subscribeOpponentName(fakeCallBack);
            expect(onSpy).toHaveBeenCalledWith('opponentName', fakeCallBack);
        });
    });

    describe('subscribeGameTied', () => {
        it('should call the on method with the right parameters', () => {
            const onSpy = spyOn(service, 'on');
            service.subscribeGameTied(fakeCallBack);
            expect(onSpy).toHaveBeenCalledWith('gameTied', fakeCallBack);
        });
    });

    describe('unsubscribeBaseSocketFeatures', () => {
        it('should call the off method with "images"', () => {
            const onSpy = spyOn(socket, 'off');
            service.unsubscribeBaseSocketFeatures();
            expect(onSpy).toHaveBeenCalledWith('images');
        });
        it('should call the off method with "timer"', () => {
            const onSpy = spyOn(socket, 'off');
            service.unsubscribeBaseSocketFeatures();
            expect(onSpy).toHaveBeenCalledWith('timer');
        });
    });

    describe('unsubscribeMessageSent', () => {
        it('should call the off method with "roomCreated"', () => {
            const onSpy = spyOn(socket, 'off');
            service.unsubscribeMessageSent();
            expect(onSpy).toHaveBeenCalledWith('messageSent');
        });
    });

    describe('unsubscribeMessageSent', () => {
        it('should call the off method with "roomCreated"', () => {
            const onSpy = spyOn(socket, 'off');
            service.unsubscribeMessageSent();
            expect(onSpy).toHaveBeenCalledWith('messageSent');
        });
    });

    describe('unsubscribeGameSocketFeatures', () => {
        it('should call the off method with "abandonedGame"', () => {
            const onSpy = spyOn(socket, 'off');
            service.unsubscribeGameSocketFeatures();
            expect(onSpy).toHaveBeenCalledWith('abandonedGame');
        });
        it('should call the off method with "playerWonGame"', () => {
            const onSpy = spyOn(socket, 'off');
            service.unsubscribeGameSocketFeatures();
            expect(onSpy).toHaveBeenCalledWith('playerWonGame');
        });
    });

    describe('unsubscribeHostUpdates', () => {
        it('should call the off method with "addedNameHostList"', () => {
            const onSpy = spyOn(socket, 'off');
            service.unsubscribeHostUpdates();
            expect(onSpy).toHaveBeenCalledWith('addedNameHostList');
        });
        it('should call the off method with "participantLeft"', () => {
            const onSpy = spyOn(socket, 'off');
            service.unsubscribeHostUpdates();
            expect(onSpy).toHaveBeenCalledWith('participantLeft');
        });
    });

    describe('unsubscribeParticipantUpdates', () => {
        it('should call the off method with "playerDecision"', () => {
            const onSpy = spyOn(socket, 'off');
            service.unsubscribeParticipantUpdates();
            expect(onSpy).toHaveBeenCalledWith('playerDecision');
        });
        it('should call the off method with "roomDeleted"', () => {
            const onSpy = spyOn(socket, 'off');
            service.unsubscribeParticipantUpdates();
            expect(onSpy).toHaveBeenCalledWith('roomDeleted');
        });
    });

    describe('unsubscribeTimer', () => {
        it('should call the off method with "timer"', () => {
            const onSpy = spyOn(socket, 'off');
            service.unsubscribeTimer();
            expect(onSpy).toHaveBeenCalledWith('timer');
        });
    });

    describe('unsubscribeOpponentName', () => {
        it('should call the off method with "opponentName"', () => {
            const onSpy = spyOn(socket, 'off');
            service.unsubscribeOpponentName();
            expect(onSpy).toHaveBeenCalledWith('opponentName');
        });
    });

    describe('unsubscribeParticipantLeft', () => {
        it('should call the off method with "participantLeft"', () => {
            const onSpy = spyOn(socket, 'off');
            service.unsubscribeParticipantLeft();
            expect(onSpy).toHaveBeenCalledWith('participantLeft');
        });
    });

    describe('unsubscribeLimitedGameEvents', () => {
        it('should call the off method with "participantLeft"', () => {
            const onSpy = spyOn(socket, 'off');
            service.unsubscribeLimitedGameEvents();
            expect(onSpy).toHaveBeenCalledWith('validation');
            expect(onSpy).toHaveBeenCalledWith('changeGame');
            expect(onSpy).toHaveBeenCalledWith('limitedGameDone');
            expect(onSpy).toHaveBeenCalledWith('images');
            expect(onSpy).toHaveBeenCalledWith('playerReady');
        });
    });

    describe('unsubscribeAdministration', () => {
        it('should call the off all administration page socket methods"', () => {
            const onSpy = spyOn(socket, 'off');
            service.unsubscribeAdministration();
            expect(onSpy).toHaveBeenCalledWith(GameEvents.FailedReset);
            expect(onSpy).toHaveBeenCalledWith(GameEvents.FailedDelete);
            expect(onSpy).toHaveBeenCalledWith(GameEvents.FailedResetAll);
            expect(onSpy).toHaveBeenCalledWith(GameEvents.FailedDeleteAll);
        });
    });

    describe('limitedGameDone', () => {
        it('should call the on method with the right parameters', () => {
            const onSpy = spyOn(service.socket, 'on');
            service.subscribeLimitedGameDone(fakeCallBack);
            expect(onSpy).toHaveBeenCalledWith('limitedGameDone', fakeCallBack);
        });
    });

    describe('unsubscribeLimitedWaitingRoomEvents', () => {
        it('should call the off method with "participantLeft"', () => {
            const onSpy = spyOn(socket, 'off');
            service.unsubscribeLimitedWaitingRoomEvents();
            expect(onSpy).toHaveBeenCalledWith('roomJoined');
        });
    });

    afterEach(() => {
        service.disconnect();
    });
});
