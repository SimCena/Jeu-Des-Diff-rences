/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ChildrenOutletContexts, UrlSerializer } from '@angular/router';
import { PlayerInfo } from '@common/player-info';
import { ClockService } from '@app/services/clock.service';
import { GameHandlerService } from '@app/services/game-handler.service';
import { SocketService } from '@app/services/socket.service';

import { MultiGameRunnerService } from './multi-game-runner.service';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/modules/material.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AttemptResponse } from '@common/games';
import { PlayerRanking } from '@common/player-ranking';

const testAttemptResponse: AttemptResponse = {
    difference: {
        differenceNumber: 5,
        positions: [1, 2, 3],
    },
    playerId: '0',
};

const testAttemptResponse2: AttemptResponse = {
    difference: {
        differenceNumber: 5,
        positions: [1, 2, 3],
    },
    playerId: '1',
};

@Injectable({
    providedIn: 'root',
})
class MockSocketService extends SocketService {
    send(): void {
        return;
    }
    on(): void {
        return;
    }
    subscribeOpponentReady(): void {
        return;
    }
    subscribeOpponentName(): void {
        return;
    }
    subscribeParticipantLeft(): void {
        return;
    }
    subscribeTimer(): void {
        return;
    }
    subscribePlayerWonGame(): void {
        return;
    }
    subscribeGameTied(): void {
        return;
    }
    subscribeValidation(): void {
        return;
    }
    subscribeImages(): void {
        return;
    }
    sendPlayerName(): void {
        return;
    }
    getSocketId(): string {
        return '0';
    }
}

@Injectable({
    providedIn: 'root',
})
class MockGameHandlerService extends GameHandlerService {
    // eslint-disable-next-line no-unused-vars
    giveSuccessFeedback(attemptResponse: AttemptResponse): void {
        return;
    }
}

@Injectable({
    providedIn: 'root',
})
class MockClockService extends ClockService {}

describe('MultiGameRunnerService', () => {
    let socketService: SocketService;
    let gameHandlerService: GameHandlerService;
    let clockService: ClockService;
    let service: MultiGameRunnerService;
    let socketAliveSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: SocketService,
                    useClass: MockSocketService,
                },
                {
                    provide: GameHandlerService,
                    useClass: MockGameHandlerService,
                },
                {
                    provide: ClockService,
                    useClass: MockClockService,
                },
                UrlSerializer,
                ChildrenOutletContexts,
            ],
            imports: [AppMaterialModule, RouterTestingModule, HttpClientTestingModule],
        });

        socketService = TestBed.inject(SocketService);
        gameHandlerService = TestBed.inject(GameHandlerService);
        clockService = TestBed.inject(ClockService);
        service = TestBed.inject(MultiGameRunnerService);

        socketAliveSpy = spyOn(socketService, 'isSocketAlive').and.returnValue(true);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('constructor', () => {
        it('should init playerInfos', () => {
            expect(service.playerInfos).toEqual([]);
        });
        it('should set number of differences to [0, 0]', () => {
            expect(service.numberDifferencesFound).toEqual([0, 0]);
        });
        it('should set opponentStillThere to true', () => {
            expect(service.opponentStillThere).toBeTrue();
        });
    });

    describe('initSocketSubscriptions', () => {
        it('should call subscribeValidation of socketService if the socket is alive', () => {
            const spy = spyOn(socketService, 'subscribeValidation');
            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalled();
        });
        it('should not reach call subscribeValidation of socketService if the socket is not alive', () => {
            socketAliveSpy.and.returnValue(false);
            const spy = spyOn(socketService, 'subscribeValidation');
            service.initSocketSubscriptions();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should callback from socketService should set opponent ready to true if its not this socket', () => {
            const playerInfo: PlayerInfo = {
                name: 'simon',
                socketId: 'testID',
            };
            spyOn(socketService, 'subscribeOpponentReady').and.callFake((callback) => {
                return callback(playerInfo);
            });
            spyOn(socketService, 'getSocketId').and.returnValue('fakeID');

            service.initSocketSubscriptions();
            expect(service.opponentName).not.toBeNull();
        });
        it('should callback from socketService should call resetTimer if player is also ready', () => {
            const playerInfo: PlayerInfo = {
                name: 'simon',
                socketId: 'testID',
            };
            spyOn(socketService, 'subscribeOpponentReady').and.callFake((callback) => {
                return callback(playerInfo);
            });
            spyOn(socketService, 'getSocketId').and.returnValue('fakeID');
            gameHandlerService.playerReady = true;
            const spy = spyOn(clockService, 'startTimer');

            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalled();
        });
        it('should add the opponent name to the names list when received', () => {
            spyOn(socketService, 'getSocketId').and.returnValue('testID');
            spyOn(socketService, 'subscribeOpponentReady').and.callFake((callback) => {
                return callback({ name: 'test2', socketId: '' });
            });
            service['playerInfos'] = [{ name: 'test', socketId: '' }];

            service.initSocketSubscriptions();
            expect(service['playerInfos'][1]).toEqual({ name: 'test2', socketId: '' });
        });
        it('should not call endGame if the participant left is himself', () => {
            spyOn(socketService, 'subscribeParticipantLeft').and.callFake((callback) => {
                return callback('test');
            });
            const spy = spyOn(gameHandlerService, 'endGame');
            service['playerInfos'] = [
                { name: 'test', socketId: 'test' },
                { name: 'other', socketId: 'id' },
            ];
            service.initSocketSubscriptions();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should call endGame if the participant left is opponent', () => {
            spyOn(socketService, 'subscribeParticipantLeft').and.callFake((callback) => {
                return callback('id');
            });
            const spy = spyOn(gameHandlerService, 'endGame');
            service['playerInfos'] = [
                { name: 'test', socketId: 'test' },
                { name: 'other', socketId: 'id' },
            ];
            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalled();
        });
        it('subscribeValidation callback should call lockAttempts', () => {
            spyOn(socketService, 'subscribeValidation').and.callFake((callback) => {
                return callback(testAttemptResponse);
            });
            spyOn<any>(service, 'sendFeedback');
            const spy = spyOn<any>(service, 'lockAttempts');
            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalled();
        });
        it('subscribePlayerWonGame callback should call endGame', () => {
            spyOn(socketService, 'subscribePlayerWonGame').and.callFake((callback) => {
                return callback(
                    {
                        name: 'simon',
                        socketId: '0',
                    },
                    { ranking: PlayerRanking.Second, time: 32 },
                );
            });
            const spy = spyOn<any>(service['gameHandlerService'], 'endGame');
            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalledWith('simon', { ranking: PlayerRanking.Second, time: 32 }, true);
        });
        it('subscribeGameTied callback should call endGame', () => {
            spyOn(socketService, 'subscribeGameTied').and.callFake((callback) => {
                return callback({
                    name: 'simon',
                    socketId: '0',
                });
            });
            const spy = spyOn<any>(service['gameHandlerService'], 'endGame');
            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalledWith('', { ranking: PlayerRanking.None, time: 0 }, false);
        });
        it('should call receiveImageAndCheckgameStart', () => {
            const spy = spyOn(service, 'subscribeImages');

            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('receiveImageAndCheckgameStart', () => {
        it('should call subscribeImages on socket service', () => {
            const spy = spyOn(socketService, 'subscribeImages');

            service.subscribeImages();
            expect(spy).toHaveBeenCalled();
        });
        it('should set playerReady to true', () => {
            spyOn(socketService, 'subscribeImages').and.callFake((callback) => {
                return callback({
                    original: [],
                    modified: [],
                    differenceNumber: 5,
                });
            });
            service['gameHandlerService'].playerName = 'simon';

            service.initSocketSubscriptions();
            expect(gameHandlerService.playerReady).toBeTrue();
        });
        it('callback should call sendPlayerReady', () => {
            spyOn(socketService, 'subscribeImages').and.callFake((callback) => {
                return callback({
                    original: [],
                    modified: [],
                    differenceNumber: 5,
                });
            });
            service['gameHandlerService'].playerName = 'simon';
            const spy = spyOn(service['socketService'], 'sendPlayerReady');

            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalledWith({ name: 'simon', socketId: '0' });
        });
        it('callback should call startGame if opponentReady', () => {
            spyOn(socketService, 'subscribeImages').and.callFake((callback) => {
                return callback({
                    original: [],
                    modified: [],
                    differenceNumber: 5,
                });
            });
            gameHandlerService.opponentReady = true;
            service['gameHandlerService'].playerName = 'simon';
            const spy = spyOn(service, 'startGame');

            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('getPlayerName', () => {
        it('should return the player name if it has been initialized', () => {
            service['gameHandlerService'].playerName = 'simon';
            expect(service['getPlayerName']()).toEqual('simon');
        });
        it('should return the an unknown name if it has not been initialized', () => {
            service['gameHandlerService'].playerName = undefined as unknown as string;
            expect(service['getPlayerName']()).toEqual('Inconnu');
        });
    });

    describe('getDifferencesFound', () => {
        it('should get the differences found by the player', () => {
            service['numberDifferencesFound'] = [3, 5];
            expect(service['getDifferencesFound'](0)).toBe('3');
        });
        it('should get the differences found by the opponent', () => {
            service['numberDifferencesFound'] = [3, 5];
            expect(service['getDifferencesFound'](1)).toBe('5');
        });
    });

    describe('startGame', () => {
        it('should set gameHasStarted on game handler to true', () => {
            service.startGame();
            expect(gameHandlerService.gameHasStarted).toBeTrue();
        });
        it('should start the timer', () => {
            const spy = spyOn(clockService, 'startTimer');

            service.startGame();
            expect(spy).toHaveBeenCalled();
        });
        it('should startGame on socketService', () => {
            const spy = spyOn(socketService, 'startGame');

            service.startGame();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('configureCheatToggle', () => {
        it('should subscribe to keydown and call keyPressed when event occurs', () => {
            const keyEvent = new KeyboardEvent('keydown', { ctrlKey: false, altKey: false, shiftKey: false, key: 't' });
            service['configureKeyToggle']();
            const keyPressedSpy = spyOn<any>(service, 'keyPressed');
            document.body.dispatchEvent(keyEvent);
            expect(keyPressedSpy).toHaveBeenCalled();
        });
    });

    describe('initBooleans', () => {
        it('should initialize the different boolean variables', () => {
            service['gameHandlerService'].playerReady = undefined as unknown as boolean;
            service['gameHandlerService'].attemptsEnabled = undefined as unknown as boolean;
            service['opponentStillThere'] = undefined as unknown as boolean;
            service['initBooleans']();
            expect(service['gameHandlerService'].playerReady).toBeFalse();
            expect(service['gameHandlerService'].attemptsEnabled).toBeTrue();
            expect(service['opponentStillThere']).toBeTrue();
        });
    });

    describe('initDifferences', () => {
        it('should initialize the differences', () => {
            service['playerInfos'] = undefined as unknown as PlayerInfo[];
            service['numberDifferencesFound'] = undefined as unknown as number[];
            service['initDifferences']();
            expect(service['playerInfos']).toEqual([]);
            expect(service['numberDifferencesFound']).toEqual([0, 0]);
        });
    });

    describe('giveSuccessFeedback', () => {
        it('should call the game handler service method of the same name', () => {
            const spy = spyOn<any>(service['gameHandlerService'], 'giveSuccessFeedback');
            service['giveSuccessFeedback'](testAttemptResponse);
            expect(spy).toHaveBeenCalledWith(testAttemptResponse);
        });
        it('should updateDifferencesFound', () => {
            const spy = spyOn<any>(service, 'updateDifferencesFound');
            service['giveSuccessFeedback'](testAttemptResponse);
            expect(spy).toHaveBeenCalledWith(testAttemptResponse);
        });
    });

    describe('giveFailFeedback', () => {
        it('should call the game handler service method of the same name', () => {
            const spy = spyOn<any>(service['gameHandlerService'], 'giveFailFeedback');
            service['giveFailFeedback']();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('updateDifferencesFound', () => {
        it("should update the player's differences if the player is the one who guessed", () => {
            service['numberDifferencesFound'] = [0, 0];
            service['updateDifferencesFound'](testAttemptResponse);
            expect(service['numberDifferencesFound']).toEqual([1, 0]);
        });
        it("should update the player's differences if the player is the one who guessed", () => {
            service['numberDifferencesFound'] = [0, 0];
            service['updateDifferencesFound'](testAttemptResponse2);
            expect(service['numberDifferencesFound']).toEqual([0, 1]);
        });
    });

    describe('keyPressed', () => {
        it('should not invert isCheatMode if key is not t', () => {
            gameHandlerService['isCheatMode'] = true;
            gameHandlerService.gameHasStarted = true;
            const keyEvent = new KeyboardEvent('keydown', { ctrlKey: false, altKey: false, shiftKey: false, key: 'y' });
            service['keyPressed'](keyEvent);
            expect(gameHandlerService['isCheatMode']).toBeTrue();
        });
        it('should invert isCheatMode if key is t', () => {
            gameHandlerService['isCheatMode'] = true;
            gameHandlerService.gameHasStarted = true;
            const keyEvent = new KeyboardEvent('keydown', { ctrlKey: false, altKey: false, shiftKey: false, key: 't' });
            service['keyPressed'](keyEvent);
            expect(gameHandlerService['isCheatMode']).toBeFalse();
        });
    });
});
