/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-imports */
/* eslint-disable max-lines */
/* eslint-disable max-classes-per-file */
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NameInputValue } from '@app/interfaces/name-input-value';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameRequestsService } from '@app/services/game-requests.service';
import { SoloGameRunnerService } from '@app/services/game-runner/solo-game-runner.service';
import { SocketService } from '@app/services/socket.service';
// import { Attempt } from '@common/attempt';
import { AttemptResponse, GameClient } from '@common/games';
import { PlayerRanking } from '@common/player-ranking';
import { CheatingModeService } from '../cheating-mode.service';
import { ClockService } from '../clock.service';
import { CommunicationService } from '../communication.service';
import { GameHandlerService } from '../game-handler.service';
import { MouseHandlerService } from '../mouse-handler.service';

const stubGame: GameClient = {
    id: 0,
    name: 'test',
    url: '',
    solo: [],
    multiplayer: [],
    differenceCount: 1,
};

@Injectable({
    providedIn: 'root',
})
class MockGameHandlerService extends GameHandlerService {
    endGame(): void {
        return;
    }
}

@Injectable({
    providedIn: 'root',
})
class MockClockService extends ClockService {
    alterTimer(): void {
        return;
    }
}

@Injectable({
    providedIn: 'root',
})
class MockGameService extends GameRequestsService {
    hasGames() {
        return true;
    }

    getGame() {
        return stubGame;
    }

    abandonGame(): void {
        return;
    }
}

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

    getSocketId(): string {
        return '';
    }
    validateAttempt(): void {
        // attempt.coords = { x: attempt.coords.x, y: attempt.coords.y };
        return;
    }
    unsubscribeBaseSocketFeatures(): void {
        return;
    }
    unsubscribeGameSocketFeatures(): void {
        return;
    }
    isSocketAlive(): boolean {
        return true;
    }
}

@Injectable({
    providedIn: 'root',
})
class MockMouseHandlerService extends MouseHandlerService {}

@Injectable({
    providedIn: 'root',
})
class MockCheatingService extends CheatingModeService {
    getClue(): void {
        return;
    }
}

describe('SoloGameRunnerService', () => {
    let service: SoloGameRunnerService;
    let gameHandlerService: GameHandlerService;
    let gameRequestsService: GameRequestsService;
    let socketService: SocketService;
    let clockService: ClockService;
    let mouseHandlerService: MouseHandlerService;
    let cheatingModeService: MockCheatingService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                AppMaterialModule,
                BrowserAnimationsModule,
                CommonModule,
                HttpClientTestingModule,
                FormsModule,
                ReactiveFormsModule,
                RouterTestingModule,
            ],
            providers: [
                CommunicationService,
                {
                    provide: GameHandlerService,
                    useClass: MockGameHandlerService,
                },
                {
                    provide: GameRequestsService,
                    useClass: MockGameService,
                    import: CommonModule,
                },
                { provide: SocketService, useClass: MockSocketService },
                { provide: ClockService, useClass: MockClockService },
                { provide: MouseHandlerService, useClass: MockMouseHandlerService },
                { provide: CheatingModeService, useClass: MockCheatingService },
            ],
        });

        mouseHandlerService = TestBed.inject(MouseHandlerService);
        gameHandlerService = TestBed.inject(GameHandlerService);
        gameRequestsService = TestBed.inject(GameRequestsService);
        socketService = TestBed.inject(SocketService);
        clockService = TestBed.inject(ClockService);
        service = TestBed.inject(SoloGameRunnerService);
        cheatingModeService = TestBed.inject(CheatingModeService);
    });

    it('should be created', () => {
        if (socketService && gameRequestsService) expect(service).toBeTruthy();
    });

    describe('initSocketSubscriptions', () => {
        it('should call subscribeValidation of socketService if the socket is alive', () => {
            const spy = spyOn(socketService, 'subscribeValidation');
            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalled();
        });
        it('should not reach call subscribeValidation of socketService if the socket is not alive', () => {
            spyOn(socketService, 'isSocketAlive').and.returnValue(false);
            const spy = spyOn(socketService, 'subscribeValidation');
            service.initSocketSubscriptions();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should call subscribeSoloGameWon of socketService if the socket is alive', () => {
            const spy = spyOn(socketService, 'subscribeSoloGameWon');

            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalled();
        });
        it('should set attemptsEnabled to false on game handler on solo game won', () => {
            gameHandlerService.attemptsEnabled = true;
            spyOn(socketService, 'subscribeSoloGameWon').and.callFake((callback) => {
                return callback({ ranking: PlayerRanking.Third, time: 43 });
            });
            service.initSocketSubscriptions();
            expect(gameHandlerService.attemptsEnabled).toBeFalse();
        });
        it('should call endGame on game handler with local player name', () => {
            gameHandlerService.playerName = 'testName';
            spyOn(socketService, 'subscribeSoloGameWon').and.callFake((callback) => {
                return callback({ ranking: PlayerRanking.Third, time: 43 });
            });
            const spy = spyOn<any>(gameHandlerService, 'endGame');
            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalledWith(gameHandlerService.playerName, { ranking: PlayerRanking.Third, time: 43 }, true);
        });
        it('should not reach call subscribeSoloGameWon of socketService if the socket is not alive', () => {
            spyOn(socketService, 'isSocketAlive').and.returnValue(false);
            const spy = spyOn(socketService, 'subscribeSoloGameWon');

            service.initSocketSubscriptions();
            expect(spy).not.toHaveBeenCalled();
        });
        it('subscribeValidation callback should call sendFeedback with attemptResponse', () => {
            const attemptResponse: AttemptResponse = {
                difference: {
                    differenceNumber: 1,
                    positions: [0, 1, 2],
                },
                playerId: 'simon',
            };
            spyOn(socketService, 'subscribeValidation').and.callFake((callback) => {
                return callback(attemptResponse);
            });
            const spy = spyOn<any>(service, 'sendFeedback');
            spyOn<any>(service, 'lockAttempts');
            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalledWith(attemptResponse);
        });
        it('subscribeValidation callback should call lockAttempts', () => {
            const attemptResponse: AttemptResponse = {
                difference: {
                    differenceNumber: 1,
                    positions: [0, 1, 2],
                },
                playerId: 'simon',
            };
            spyOn(socketService, 'subscribeValidation').and.callFake((callback) => {
                return callback(attemptResponse);
            });
            spyOn<any>(service, 'sendFeedback');
            const spy = spyOn<any>(service, 'lockAttempts');
            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalled();
        });
        it('should call subscribeImages of socketService if the socket is alive', () => {
            const spy = spyOn(socketService, 'subscribeImages');

            service.initSocketSubscriptions();
            expect(spy).toHaveBeenCalled();
        });
        it('should not call subscribeImages of socketService if socket not alive', () => {
            spyOn(socketService, 'isSocketAlive').and.returnValue(false);
            const spy = spyOn(socketService, 'subscribeImages').and.callFake((callback) => {
                return callback({ original: [], modified: [], differenceNumber: 0 });
            });

            service.initSocketSubscriptions();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should call endGame on game handler with local player name', () => {
            gameHandlerService.playerReady = false;
            spyOn(socketService, 'subscribeImages').and.callFake((callback) => {
                return callback({ original: [], modified: [], differenceNumber: 0 });
            });

            service.initSocketSubscriptions();
            expect(gameHandlerService.playerReady).toBeTrue();
        });
    });

    describe('getPlayerName', () => {
        it('should return the player name if it is known', () => {
            gameHandlerService['playerName'] = 'test';
            expect(service['getPlayerName']()).toBe('test');
        });
        it('should return an unknown player name if it is unknown', () => {
            expect(service['getPlayerName']()).toBe('Inconnu');
        });
    });

    describe('getDifferenceMessage', () => {
        it('should return 0 if 0 difference found', () => {
            service['numberDifferencesFound'] = 0;
            expect(service['getDifferencesMessage']()).toBe('0');
        });
        it('should return 1 trouvée if 1 difference found', () => {
            service['numberDifferencesFound'] = 1;
            expect(service['getDifferencesMessage']()).toBe('1');
        });
        it('should return X if X difference found', () => {
            service['numberDifferencesFound'] = 2;
            expect(service['getDifferencesMessage']()).toBe('2');
        });
    });

    describe('sendAttempt', () => {
        it('should not call startGame if nameInputValue is undefined', () => {
            const spy = spyOn<any>(service, 'startGame');

            service.validateNameInput(undefined as unknown as NameInputValue);
            expect(spy).not.toHaveBeenCalled();
        });
        it('should set attemptsEnabled to false on gameHandlerService', () => {
            gameHandlerService.attemptsEnabled = true;

            service.sendAttempt();
            expect(gameHandlerService.attemptsEnabled).toBeFalse();
        });
        it('should call validateAttempt on socketService with right attributes', () => {
            mouseHandlerService.relativePosition = { x: 0, y: 1 };
            gameRequestsService.currentGameId = 42;
            const spy = spyOn(socketService, 'validateAttempt');

            service.sendAttempt();
            expect(spy).toHaveBeenCalledWith({ coords: { x: 0, y: 1 }, currentGameId: 42 });
        });
    });

    describe('validateNameInput', () => {
        it('should call abandonGame if nameInputValue not confirmed', () => {
            const spy = spyOn(gameRequestsService, 'abandonGame');

            service['validateNameInput']({ name: '', confirmed: false });
            expect(spy).toHaveBeenCalled();
        });
        it('should change the gameRunner playerName if nameInputValue confirmed', () => {
            spyOn<any>(service, 'startGame');
            spyOn(gameRequestsService, 'abandonGame');
            gameHandlerService.playerName = 'default';
            service['validateNameInput']({ name: 'test', confirmed: true });
            expect(gameHandlerService.playerName).toBe('test');
        });
        it('should call startGame if nameInputValue is valid', () => {
            spyOn(gameRequestsService, 'abandonGame');
            const spy = spyOn<any>(service, 'startGame');
            service['validateNameInput']({ name: 'test', confirmed: true });
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('initBooleans', () => {
        it('should set all booleans attributes to true', () => {
            gameHandlerService.playerReady = true;
            gameHandlerService.gameHasStarted = false;
            gameHandlerService.attemptsEnabled = false;
            service['initBooleans']();
            expect(gameHandlerService.playerName || !gameHandlerService.gameHasStarted || !gameHandlerService.attemptsEnabled).toBeFalse();
        });
    });

    describe('initDifferences', () => {
        it('should set numberDifferencesFound to 0', () => {
            service.numberDifferencesFound = 1;
            service['initDifferences']();
            expect(service['numberDifferencesFound']).toEqual(0);
        });
    });

    describe('giveSuccessFeedback', () => {
        it('should call giveSuccessFeedback on the gameHandler', () => {
            const spy = spyOn(gameHandlerService, 'giveSuccessFeedback');
            const attemptResponse: AttemptResponse = { difference: { differenceNumber: 0, positions: [] }, playerId: 'test' };

            spyOn(Audio.prototype, 'play').and.callFake(() => {
                return;
            });
            spyOn<any>(service, 'updateDifferencesFound');
            service['giveSuccessFeedback'](attemptResponse);
            expect(spy).toHaveBeenCalledWith(attemptResponse);
        });
    });

    describe('giveFailFeedback', () => {
        it('should call giveSuccessFeedback on the gameHandler', () => {
            const spy = spyOn(gameHandlerService, 'giveFailFeedback');

            service['giveFailFeedback']();
            expect(spy).toHaveBeenCalledWith();
        });
    });

    describe('updateDifferencesFound', () => {
        it('should increment player numberdifferencesFound if same socket', () => {
            service['numberDifferencesFound'] = 0;
            spyOn(socketService, 'getSocketId').and.callFake(() => {
                return 'simon';
            });
            service['updateDifferencesFound']();
            expect(service['numberDifferencesFound']).toBe(1);
        });
        it('should increment opponent numberdifferencesFound if not same socket', () => {
            service['numberDifferencesFound'] = 0;
            spyOn(socketService, 'getSocketId').and.callFake(() => {
                return 'simon';
            });
            service['updateDifferencesFound']();
            expect(service['numberDifferencesFound']).toBe(1);
        });
    });

    describe('startGame', () => {
        it('should call startTimer on the clockService', () => {
            const spy = spyOn(clockService, 'startTimer');
            service['startGame']();
            expect(spy).toHaveBeenCalled();
        });
        it('should set gameHasStarted to true on gameHandlerService', () => {
            gameHandlerService.gameHasStarted = false;
            spyOn(clockService, 'startTimer');
            service['startGame']();
            expect(gameHandlerService.gameHasStarted).toBeTrue();
        });
    });

    describe('keyPressed', () => {
        beforeEach(() => {
            gameHandlerService.playerReady = true;
        });
        it('should call activateClue if key is i', () => {
            gameHandlerService['isCheatMode'] = true;
            gameHandlerService.gameHasStarted = true;
            const spy = spyOn(service, 'activateClue');
            const keyEvent = new KeyboardEvent('keydown', { ctrlKey: false, altKey: false, shiftKey: false, key: 'i' });
            service['keyPressed'](keyEvent);
            expect(spy).toHaveBeenCalled();
        });
        it('should not call activateClue if key is not i', () => {
            gameHandlerService['isCheatMode'] = true;
            gameHandlerService.gameHasStarted = true;
            const spy = spyOn(service, 'activateClue');
            const keyEvent = new KeyboardEvent('keydown', { ctrlKey: false, altKey: false, shiftKey: false, key: 't' });
            service['keyPressed'](keyEvent);
            expect(spy).not.toHaveBeenCalled();
        });
        it('should invert isCheatMode if key is t', () => {
            gameHandlerService['isCheatMode'] = true;
            gameHandlerService.gameHasStarted = true;
            const keyEvent = new KeyboardEvent('keydown', { ctrlKey: false, altKey: false, shiftKey: false, key: 't' });
            service['keyPressed'](keyEvent);
            expect(gameHandlerService['isCheatMode']).toBeFalse();
        });
    });

    describe('activateClue', () => {
        beforeEach(() => {
            gameHandlerService.gameConstants = {
                initialTime: 0,
                hintUsedTime: 0,
                goodGuessTime: 0,
            };
            service.isClueMode = false;
        });
        it('should call getClue if theres clues left', () => {
            cheatingModeService.cluesLeft = 1;
            spyOn(socketService, 'sendMessage');
            const spy = spyOn(cheatingModeService, 'getClue');
            service.activateClue(false);
            expect(spy).toHaveBeenCalled();
        });
        it('should set isClueMode to true if theres clues left', () => {
            cheatingModeService.cluesLeft = 1;
            service.isClueMode = false;
            spyOn(socketService, 'sendMessage');
            spyOn(cheatingModeService, 'getClue');
            service.activateClue(false);
            expect(service.isClueMode).toBeTrue();
        });
        it('should call sendMessage if theres clues left', () => {
            cheatingModeService.cluesLeft = 1;
            service.isClueMode = false;
            const spy = spyOn(socketService, 'sendMessage');
            spyOn(cheatingModeService, 'getClue');
            service.activateClue(true);
            expect(spy).toHaveBeenCalled();
        });
        it('should not call getClue if theres clues left', () => {
            cheatingModeService.cluesLeft = 0;
            service.isClueMode = false;
            spyOn(socketService, 'sendMessage');
            const spy = spyOn(cheatingModeService, 'getClue');
            service.activateClue(false);
            expect(spy).not.toHaveBeenCalled();
        });
        it('should set isClueMode to false after 2 seconds', () => {
            cheatingModeService.cluesLeft = 1;
            service.isClueMode = false;
            spyOn(socketService, 'sendMessage');
            spyOn(cheatingModeService, 'getClue');
            jasmine.clock().install();
            service.activateClue(false);
            expect(service.isClueMode).toBeTrue();
            jasmine.clock().tick(2500);
            expect(service.isClueMode).toBeFalse();
            jasmine.clock().uninstall();
        });
    });
    describe('configureKeyToggles', () => {
        it('should set isCheatMode and isClueMode to false', () => {
            service.isClueMode = true;
            gameHandlerService.isCheatMode = true;
            service.configureKeyToggles();
            expect(service.isClueMode || gameHandlerService.isCheatMode).toBeFalse();
        });
        it('after configureKeyToggles is called, keyboard events on body should call keyPressed with said event', () => {
            const keyEvent = new KeyboardEvent('keydown', { ctrlKey: false, altKey: false, shiftKey: false, key: 't' });
            const spy = spyOn<any>(service, 'keyPressed');
            service.configureKeyToggles();
            document.body.dispatchEvent(keyEvent);
            expect(spy).toHaveBeenCalledWith(keyEvent);
        });
    });
});
