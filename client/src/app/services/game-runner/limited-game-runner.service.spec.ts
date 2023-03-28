/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ChildrenOutletContexts, UrlSerializer } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/modules/material.module';
import { ClockService } from '@app/services/clock.service';
import { GameHandlerService } from '@app/services/game-handler.service';
import { SocketService } from '@app/services/socket.service';
import { AttemptResponse } from '@common/games';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CongratulationsDialogLimitedComponent } from '@app/components/congratulations-dialog-limited/congratulations-dialog-limited.component';
import { LimitedGameChoice } from '@app/interfaces/limited-game-value';
import { CheatingModeService } from '@app/services/cheating-mode.service';
import { GameRequestsService } from '@app/services/game-requests.service';
import { of } from 'rxjs';
import { LimitedGameRunnerService } from './limited-game-runner.service';
import { MultiGameRunnerService } from './multi-game-runner.service';
import { SoloGameRunnerService } from './solo-game-runner.service';

@Injectable({
    providedIn: 'root',
})
class MockSocketService extends SocketService {
    on(): void {
        return;
    }
    send(): void {
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
    subscribeChangeGame(): void {
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
    opponentName(): void {
        return;
    }
    getSocketId(): string {
        return '0';
    }
    unsubscribeLimitedGameEvents(): void {
        return;
    }
    pauseTimer(): void {
        return;
    }
    createNewGame(): void {
        return;
    }
    subscribeLimitedGameDone(): void {
        return;
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
class MockSoloGameRunnerService extends SoloGameRunnerService {}

@Injectable({
    providedIn: 'root',
})
class MockMultiGameRunnerService extends MultiGameRunnerService {}

@Injectable({
    providedIn: 'root',
})
class MockGameRequestsService extends GameRequestsService {}

@Injectable({
    providedIn: 'root',
})
class MockCheatingModeService extends CheatingModeService {}

@Injectable({
    providedIn: 'root',
})
class MockClockService extends ClockService {
    stopTimer(): void {
        return;
    }
}

describe('LimitedGameRunnerService', () => {
    let service: LimitedGameRunnerService;
    let soloGameRunner: SoloGameRunnerService;
    let multiGameRunner: MultiGameRunnerService;
    let gameHandlerService: GameHandlerService;
    let gameRequestsService: GameRequestsService;
    let socketService: SocketService;
    let clockService: ClockService;
    let cheatingModeService: CheatingModeService;
    let socketAliveSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CongratulationsDialogLimitedComponent],
            providers: [
                {
                    provide: SoloGameRunnerService,
                    useClass: MockSoloGameRunnerService,
                },
                {
                    provide: MultiGameRunnerService,
                    useClass: MockMultiGameRunnerService,
                },
                {
                    provide: SocketService,
                    useClass: MockSocketService,
                },
                {
                    provide: GameHandlerService,
                    useClass: MockGameHandlerService,
                },
                {
                    provide: GameRequestsService,
                    useClass: MockGameRequestsService,
                },
                {
                    provide: ClockService,
                    useClass: MockClockService,
                },
                {
                    provide: CheatingModeService,
                    useClass: MockCheatingModeService,
                },
                UrlSerializer,
                ChildrenOutletContexts,
            ],
            imports: [AppMaterialModule, RouterTestingModule, HttpClientTestingModule, BrowserAnimationsModule],
        });

        soloGameRunner = TestBed.inject(SoloGameRunnerService);
        multiGameRunner = TestBed.inject(MultiGameRunnerService);
        gameHandlerService = TestBed.inject(GameHandlerService);
        gameRequestsService = TestBed.inject(GameRequestsService);
        socketService = TestBed.inject(SocketService);
        clockService = TestBed.inject(ClockService);
        cheatingModeService = TestBed.inject(CheatingModeService);
        service = TestBed.inject(LimitedGameRunnerService);
        socketAliveSpy = spyOn(socketService, 'isSocketAlive').and.returnValue(true);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('initSocketSubscrptions', () => {
        it('should not call anything if socket not alive', () => {
            socketAliveSpy.and.returnValue(false);
            const spy = spyOn(socketService, 'subscribeValidation');
            service.initSocketSubscriptions();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should call subscribeValidation on socket service', () => {
            const spy = spyOn(socketService, 'subscribeValidation');

            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalled();
        });
        it('should call sendFeedback on validation', () => {
            const attemptResponse: AttemptResponse = {
                difference: {
                    differenceNumber: 1,
                    positions: [0, 1, 2],
                },
                playerId: 'simon',
            };
            spyOn(Audio.prototype, 'play').and.callFake(() => {
                return;
            });
            spyOn(socketService, 'subscribeValidation').and.callFake((callback) => {
                return callback(attemptResponse);
            });
            const spy = spyOn<any>(service, 'sendFeedback');

            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalledWith(attemptResponse);
        });
        it('should lockAttemps on validation', () => {
            const attemptResponse: AttemptResponse = {
                difference: {
                    differenceNumber: 1,
                    positions: [0, 1, 2],
                },
                playerId: 'simon',
            };
            spyOn(Audio.prototype, 'play').and.callFake(() => {
                return;
            });
            spyOn(socketService, 'subscribeValidation').and.callFake((callback) => {
                return callback(attemptResponse);
            });
            const spy = spyOn<any>(service, 'lockAttempts');
            spyOn(gameHandlerService, 'findNewModifiedImage').and.callFake(() => {
                return;
            });

            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalled();
        });
        it('should call subscribeChangeGame on socket service', () => {
            const spy = spyOn(socketService, 'subscribeChangeGame');

            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalled();
        });
        it('should call stopTimer on clock service', () => {
            const spy = spyOn(clockService, 'stopTimer');
            spyOn(socketService, 'subscribeChangeGame').and.callFake((callback) => {
                return callback(4);
            });

            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalled();
        });
        it('should call pauseTimer on socket service', () => {
            const spy = spyOn(socketService, 'pauseTimer');
            spyOn(socketService, 'subscribeChangeGame').and.callFake((callback) => {
                return callback(4);
            });

            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalled();
        });
        it('should set the game id on game requests service', () => {
            spyOn(socketService, 'subscribeChangeGame').and.callFake((callback) => {
                return callback(4);
            });

            service.initSocketSubscriptions();
            expect(gameRequestsService.currentGameId).toBe(4);
        });
        it('should call createNewGame on socket service', () => {
            const spy = spyOn(socketService, 'createNewGame');
            spyOn(socketService, 'subscribeChangeGame').and.callFake((callback) => {
                return callback(4);
            });

            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalledWith(4);
        });
        it('should call getDifferencesPositions on cheating mode service', () => {
            const spy = spyOn(cheatingModeService, 'getDifferencesPositions');
            spyOn(socketService, 'subscribeChangeGame').and.callFake((callback) => {
                return callback(4);
            });

            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalled();
        });
        it('should call subscribeLimitedGameDone on socket service', () => {
            const spy = spyOn(socketService, 'subscribeLimitedGameDone');

            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalled();
        });
        it('should call reset timer on clock service if there are games left', () => {
            const spy = spyOn(clockService, 'resetTimer');
            spyOn<any, any>(service, 'endLimitedGame');
            spyOn(socketService, 'subscribeLimitedGameDone').and.callFake((callback) => {
                return callback(0, false);
            });
            gameRequestsService.games = [
                {
                    id: 0,
                    name: '',
                    url: '',
                    solo: [
                        {
                            name: '',
                            time: 0,
                        },
                    ],
                    multiplayer: [
                        {
                            name: '',
                            time: 0,
                        },
                    ],
                    differenceCount: 4,
                },
            ];
            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalled();
        });
        it('should call endLimitedGame', () => {
            const spy = spyOn<any, any>(service, 'endLimitedGame');
            spyOn(socketService, 'subscribeLimitedGameDone').and.callFake((callback) => {
                return callback(1, true);
            });
            spyOn(gameHandlerService, 'findNewModifiedImage').and.callFake(() => {
                return;
            });
            gameRequestsService.games = [
                {
                    id: 0,
                    name: '',
                    url: '',
                    solo: [
                        {
                            name: '',
                            time: 0,
                        },
                    ],
                    multiplayer: [
                        {
                            name: '',
                            time: 0,
                        },
                    ],
                    differenceCount: 4,
                },
            ];

            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalledWith(1, false);
        });
        it('should call subscribeOpponentReady on multiplayer game runner', () => {
            const spy = spyOn(multiGameRunner, 'subscribeOpponentReady');

            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalled();
        });
        it('should call subscribeParticipantLeft on socket service', () => {
            const spy = spyOn(socketService, 'subscribeParticipantLeft');

            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalled();
        });
        it('should remove the second player if socket id not the same as the local one', () => {
            multiGameRunner.playerInfos = [
                { name: 'name1', socketId: 'socket1' },
                { name: 'name2', socketId: 'socket2' },
            ];
            spyOn(socketService, 'subscribeParticipantLeft').and.callFake((callback) => {
                return callback('socketID');
            });

            service.initSocketSubscriptions();
            expect(multiGameRunner.playerInfos).toEqual([{ name: 'name1', socketId: 'socket1' }]);
        });
        it('should change gameType to solo if socket id not the same as the local one', () => {
            spyOn(socketService, 'subscribeParticipantLeft').and.callFake((callback) => {
                return callback('socketID');
            });

            service.initSocketSubscriptions();
            expect(service.gameType).toBe(LimitedGameChoice.Solo);
        });
        it('should call receiveImageAndCheckgameStart on multiplayer game runner', () => {
            const spy = spyOn(multiGameRunner, 'subscribeImages');

            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('configureKeyToggles', () => {
        it('should set isClueMode to false', () => {
            service.configureKeyToggles();

            expect(service.isClueMode).toBeFalse();
        });
        it('should set cheat mode to false on game handler service', () => {
            service.configureKeyToggles();

            expect(gameHandlerService.isCheatMode).toBeFalse();
        });
        it('should call keyPressed if the event is triggered', () => {
            const keyEvent = new Event('keydown');
            const spy = spyOn<any>(service, 'keyPressed');
            service.configureKeyToggles();

            document.body.dispatchEvent(keyEvent);
            expect(spy).toHaveBeenCalledWith(keyEvent);
        });
    });

    describe('isSolo', () => {
        it('should return true if game type is solo', () => {
            service.gameType = LimitedGameChoice.Solo;

            expect(service.isSolo()).toBeTrue();
        });
        it('should return false if game type is not solo', () => {
            service.gameType = LimitedGameChoice.Coop;
            expect(service.isSolo()).toBeFalse();

            service.gameType = LimitedGameChoice.Cancel;
            expect(service.isSolo()).toBeFalse();
        });
    });

    describe('endLimitedGame', () => {
        it('should set isCheatMode to false on game handler', () => {
            spyOn(clockService, 'stopTimer');
            spyOn<any>(service, 'congratulateLimitedPlayer');

            service['endLimitedGame'](1, true);
            expect(gameHandlerService.isCheatMode).toBeFalse();
        });
        it('should call congratulatePlayer with the winner name', () => {
            const spy = spyOn<any>(service, 'congratulateLimitedPlayer');
            spyOn(clockService, 'stopTimer');
            spyOn(clockService, 'resetTimer');

            service['endLimitedGame'](1, true);
            expect(spy).toHaveBeenCalledWith(1, true);
        });
    });

    describe('congratulatePlayer', () => {
        it('should properly end the game after closing the dialog', () => {
            gameHandlerService.playerName = 'Jean';
            const routerSpy = spyOn(service['router'], 'navigate');
            gameHandlerService.game = {
                id: 0,
                name: 'test',
                url: '',
                solo: [],
                multiplayer: [],
                differenceCount: 1,
            };
            spyOn(MatDialog.prototype, 'open').and.returnValue({
                afterClosed: () => of({}),
            } as MatDialogRef<CongratulationsDialogLimitedComponent>);
            service['congratulateLimitedPlayer'](1, true);
            expect(routerSpy).toHaveBeenCalledWith(['home']);
        });
        it('should properly end the game after closing and send right playerInfos the dialog', () => {
            gameHandlerService.playerName = 'Jean';
            const routerSpy = spyOn(service['router'], 'navigate');
            gameHandlerService.game = {
                id: 0,
                name: 'test',
                url: '',
                solo: [],
                multiplayer: [],
                differenceCount: 1,
            };
            multiGameRunner.playerInfos = [];
            multiGameRunner.playerInfos.push({
                socketId: 'simon',
                name: 'simon',
            });
            multiGameRunner.playerInfos.push({
                socketId: 'simon',
                name: 'simon',
            });
            spyOn(MatDialog.prototype, 'open').and.returnValue({
                afterClosed: () => of({}),
            } as MatDialogRef<CongratulationsDialogLimitedComponent>);
            service['congratulateLimitedPlayer'](1, true);
            expect(routerSpy).toHaveBeenCalledWith(['home']);
        });
    });

    describe('initBooleans', () => {
        it('should call initBooleans on solo game runner if game type is solo', () => {
            service.gameType = LimitedGameChoice.Solo;
            const spy = spyOn(soloGameRunner, 'initBooleans');

            service['initBooleans']();
            expect(spy).toHaveBeenCalled();
        });
        it('should set opponent ready to true on game handler if game type is solo', () => {
            service.gameType = LimitedGameChoice.Solo;

            service['initBooleans']();
            expect(gameHandlerService.opponentReady).toBeTrue();
        });
        it('should call initBooleans on multi game runner if game type is coop', () => {
            service.gameType = LimitedGameChoice.Coop;
            const spy = spyOn(multiGameRunner, 'initBooleans');

            service['initBooleans']();
            expect(spy).toHaveBeenCalled();
        });
        it('should set opponent ready to false on game handler if game type is coop', () => {
            service.gameType = LimitedGameChoice.Coop;

            service['initBooleans']();
            expect(gameHandlerService.opponentReady).toBeFalse();
        });
    });

    describe('initDifferences', () => {
        it('should initialize playerInfos', () => {
            service['initDifferences']();

            expect(service.playerInfos).toEqual([]);
        });
        it('should set number of differences found to 0', () => {
            service['initDifferences']();

            expect(service.numberDifferencesFound).toEqual(0);
        });
    });

    describe('giveSuccessFeedback', () => {
        it('should call updateDifferencesFound', () => {
            spyOn(Audio.prototype, 'play').and.callFake(() => {
                return;
            });
            spyOn(gameHandlerService, 'findNewModifiedImage').and.callFake(() => {
                return;
            });
            const spy = spyOn<any>(service, 'updateDifferencesFound');
            const attemptResponse: AttemptResponse = {
                difference: {
                    differenceNumber: 1,
                    positions: [0, 1, 2],
                },
                playerId: 'simon',
            };

            service['giveSuccessFeedback'](attemptResponse);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('giveFailFeedback', () => {
        it('should call giveFailFeedBack on the game handler', () => {
            const spy = spyOn(gameHandlerService, 'giveFailFeedback');

            service['giveFailFeedback']();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('updateDifferencesFound', () => {
        it('should add one difference to the count', () => {
            service.numberDifferencesFound = 4;

            service['updateDifferencesFound']();
            expect(service.numberDifferencesFound).toBe(5);
        });
    });

    describe('keyPressed', () => {
        beforeEach(() => {
            gameHandlerService.playerReady = true;
        });
        it('should call activateClue on solo game runner if all the conditions are satisfied', () => {
            gameHandlerService.gameHasStarted = true;
            service.isClueMode = false;
            service.gameType = LimitedGameChoice.Solo;
            const spy = spyOn(soloGameRunner, 'activateClue');

            service['keyPressed'](new KeyboardEvent('keyPressed', { key: 'i' }));
            expect(spy).toHaveBeenCalled();
        });
        it('should toggle cheat mode on game handler if all the conditions are satisfied', () => {
            gameHandlerService.gameHasStarted = true;
            gameHandlerService.isCheatMode = true;

            service['keyPressed'](new KeyboardEvent('keyPressed', { key: 't' }));
            expect(gameHandlerService.isCheatMode).toBeFalse();
        });
    });
});
