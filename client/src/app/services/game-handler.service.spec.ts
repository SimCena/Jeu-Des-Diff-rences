/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { BackgroundCanvasComponent } from '@app/components/background-canvas/background-canvas.component';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { CongratulationsDialogComponent } from '@app/components/congratulations-dialog/congratulations-dialog.component';
import { CanvasId } from '@app/models/canvas-id';
import { AppMaterialModule } from '@app/modules/material.module';

import { GameHandlerService } from '@app/services/game-handler.service';
import { GameRequestsService } from '@app/services/game-requests.service';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@common/constants/image';
import { AttemptResponse, GameClient, Images, Ranking } from '@common/games';
import { PlayerRanking } from '@common/player-ranking';
import { of, Subscription } from 'rxjs';
import { CheatingModeService } from './cheating-mode.service';
import { ClockService } from './clock.service';
import { CommunicationService } from './communication.service';
import { SocketService } from './socket.service';

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
class MockClockService extends ClockService {}

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
class MockBackgroundCanvasComponent extends BackgroundCanvasComponent {
    getCanvasElement(): HTMLElement {
        return CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT);
    }
}

@Injectable({
    providedIn: 'root',
})
class MockCheatingModeService extends CheatingModeService {
    updateDifferences(): void {
        return;
    }
}

describe('GameHandlerService', () => {
    let service: GameHandlerService;
    let gameRequestsService: GameRequestsService;
    let clockService: ClockService;
    let socketService: SocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CongratulationsDialogComponent],
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
                    provide: GameRequestsService,
                    useClass: MockGameService,
                    import: CommonModule,
                },
                { provide: SocketService, useClass: MockSocketService },
                { provide: ClockService, useClass: MockClockService },
                { provide: CheatingModeService, useClass: MockCheatingModeService },
            ],
        });

        socketService = TestBed.inject(SocketService);
        gameRequestsService = TestBed.inject(GameRequestsService);
        clockService = TestBed.inject(ClockService);
        service = TestBed.inject(GameHandlerService);
        service['gameConstants'] = { initialTime: 30, goodGuessTime: 5, hintUsedTime: 5 };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('configureGame', () => {
        it('should call configureImages', () => {
            const spy = spyOn<any>(service, 'configureImages');
            spyOn(socketService, 'createNewGame');
            spyOn<any>(service, 'initGame');

            service.configureGame();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('initGame', () => {
        it('should call all init methods and reach initGameClient', () => {
            spyOn<any>(service, 'initBooleans');
            spyOn<any>(service, 'initGameId');
            const spy = spyOn<any>(service, 'initGameClient');
            service['initGame']();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('setCanvas', () => {
        it('should set originalCanvas', () => {
            const canvas = 'test' as unknown as BackgroundCanvasComponent;
            service.setCanvas(CanvasId.ORIGINAL, canvas);
            expect(service['originalCanvas']).toBe(canvas);
        });
        it('should set modifedCanvas', () => {
            const canvas = 'test' as unknown as BackgroundCanvasComponent;
            service.setCanvas(CanvasId.MODIFIED, canvas);
            expect(service['modifiedCanvas']).toBe(canvas);
        });
    });

    describe('initBooleans', () => {
        it('should set gameHasStarted to false', () => {
            service.gameHasStarted = true;
            service.initBooleans();
            expect(service.gameHasStarted).toBeFalse();
        });
        it('should set isErrorMsgHidden to true', () => {
            service.isErrorMsgHidden = false;
            service.initBooleans();
            expect(service.isErrorMsgHidden).toBeTrue();
        });
    });

    describe('initGameConstants', () => {
        it('should initialize the game constants', () => {
            spyOn(service['communicationService'], 'getGameConstants').and.returnValue(of({ initialTime: 35, goodGuessTime: 5, hintUsedTime: 7 }));
            service['initGameConstants']();
            expect(service['gameConstants']).toEqual({ initialTime: 35, goodGuessTime: 5, hintUsedTime: 7 });
        });
    });

    describe('getGameName', () => {
        it('should return the game name if there is a game', () => {
            service.game = stubGame;
            expect(service['getGameName']()).toBe('test');
        });
        it('should return an unknown game name if there is no game', () => {
            expect(service['getGameName']()).toBe('Inconnu');
        });
    });

    describe('getDifferenceImageCount', () => {
        it('should return the difference count if there is a game', () => {
            service.game = stubGame;
            expect(service['getDifferenceImageCount']()).toBe('1');
        });
        it('should return an empty string if there is no game', () => {
            expect(service['getDifferenceImageCount']()).toBe('');
        });
    });

    describe('endGame', () => {
        it('should set isCheatMode to false', () => {
            spyOn<any>(service, 'congratulatePlayer');
            spyOn(clockService, 'stopTimer');

            service.endGame('testPlayer', { ranking: PlayerRanking.None, time: 34 }, true);
            expect(service.isCheatMode).toBeFalse();
        });
        it('should call congratulatePlayer with the winner name', () => {
            const spy = spyOn<any>(service, 'congratulatePlayer');
            spyOn(clockService, 'stopTimer');
            spyOn(clockService, 'resetTimer');

            service.endGame('testPlayer', { ranking: PlayerRanking.None, time: 34 }, true);
            expect(spy).toHaveBeenCalledWith('testPlayer', { ranking: PlayerRanking.None, time: 34 }, true);
        });
    });

    describe('giveSuccessFeedback', () => {
        it('giveFailFeedback should call displayErrorMessage', () => {
            spyOn(Audio.prototype, 'play').and.callFake(() => {
                return;
            });
            const spy = spyOn<any>(service, 'findNewModifiedImage');
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
        it('giveFailFeedback should call findNewModifiedImage', () => {
            spyOn(Audio.prototype, 'play').and.callFake(() => {
                return;
            });
            spyOn(socketService, 'sendMessage');
            spyOn(CheatingModeService.prototype, 'updateDifferences');
            const spy = spyOn<any>(service, 'displayErrorMessageOneSecond');

            service['giveFailFeedback']();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('guessDifference', () => {
        beforeEach(() => {
            service.originalCanvas = new MockBackgroundCanvasComponent();
            service.modifiedCanvas = new MockBackgroundCanvasComponent();
        });
        it('should return if attempt enable is false and should not call update', () => {
            const spy = spyOn(service['mouseHandlerService'], 'update');
            service.attemptsEnabled = false;
            service['guessDifference'](true, new MouseEvent('click'));
            expect(spy).not.toHaveBeenCalled();
        });
        it('should call update and next lines', () => {
            service.attemptsEnabled = true;
            const spy = spyOn(service['mouseHandlerService'], 'update');
            service['guessDifference'](false, new MouseEvent('click'));
            expect(spy).toHaveBeenCalled();
        });
        it('should call sendAttempt and next lines', () => {
            service.attemptsEnabled = true;
            spyOn(service['mouseHandlerService'], 'update');
            const spy = spyOn<any>(service, 'sendAttempt');
            service['guessDifference'](true, new MouseEvent('click'));
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('confirmAbandon', () => {
        it('should disconnect and abandon game when dialog is closed', () => {
            spyOn(socketService, 'getSocketId').and.returnValue('');
            const gameServiceSpy = spyOn(gameRequestsService, 'abandonGame');
            spyOn(service['dialog'], 'open').and.returnValue({
                afterClosed: () => of({}),
            } as MatDialogRef<ConfirmationDialogComponent>);
            service['confirmAbandon']();
            expect(gameServiceSpy).toHaveBeenCalled();
        });
    });

    describe('displayErrorMessageOneSecond', () => {
        it('should set isErrorMessageHidden to false immediately after function call', () => {
            service['displayErrorMessageOneSecond']();
            expect(service['isErrorMsgHidden']).toBeFalse();
        });
        it('should set isErrorMessageHidden to true one second after function call', () => {
            jasmine.clock().install();
            service['displayErrorMessageOneSecond']();
            expect(service['isErrorMsgHidden']).toBeFalse();
            jasmine.clock().tick(1000);
            expect(service['isErrorMsgHidden']).toBeTrue();
            jasmine.clock().uninstall();
        });
    });

    describe('sendAttempt', () => {
        it('should call validateAttempt from socketService', () => {
            service['mouseHandlerService'].relativePosition = { x: 1, y: 1 };
            gameRequestsService['currentGameId'] = 1;
            const spy = spyOn(socketService, 'validateAttempt');
            service['sendAttempt']();
            expect(spy).toHaveBeenCalledWith({
                coords: { x: 1, y: 1 },
                currentGameId: 1,
            });
        });
        it('should call validateAttempt from socketService', () => {
            spyOn(socketService, 'validateAttempt');
            service['attemptsEnabled'] = true;
            service['sendAttempt']();
            expect(service['attemptsEnabled']).toBeFalse();
        });
    });

    describe('initGameId', () => {
        it('should get the id in the route url', () => {
            const spy = spyOn(service['route'].snapshot.queryParamMap, 'get');
            service['initGameId']();
            expect(spy).toHaveBeenCalled();
        });
        it('should use the urlId if currentGameId is not set', () => {
            spyOn(service['route'].snapshot.queryParamMap, 'get').and.callFake(() => {
                return '1';
            });
            service['initGameId']();
            expect(gameRequestsService.currentGameId).toEqual(1);
        });
    });

    describe('initGameClient', () => {
        it('should check if gameService has games', () => {
            const spy = spyOn(gameRequestsService, 'hasGames').and.callFake(() => {
                return false;
            });
            service['initGameClient']();
            expect(spy).toHaveBeenCalled();
        });
        it('should subscribe to the gameSubject', () => {
            spyOn(gameRequestsService, 'hasGames');
            const spy = spyOn(gameRequestsService.gameSubject, 'subscribe').and.callFake(() => {
                return new Subscription();
            });
            service['initGameClient']();
            expect(spy).toHaveBeenCalled();
        });
        it('should call getGame on gameService if the service has no games', () => {
            spyOn(gameRequestsService, 'hasGames').and.returnValue(true);
            const spy = spyOn(service['gameRequestsService'], 'getGame');
            service['initGameClient']();
            expect(spy).toHaveBeenCalled();
        });
        it('should get games when the game requests service receives an update', () => {
            spyOn(gameRequestsService, 'hasGames').and.returnValue(false);
            const spy = spyOn(service['gameRequestsService'], 'getGame');
            service['initGameClient']();
            service['gameRequestsService'].gameSubject.next(true);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('configureImages', () => {
        beforeEach(() => {
            const images: Images = {
                original: [1, 2, 3],
                modified: [1, 2, 3],
                differenceNumber: 0,
            };
            spyOn(service, 'setCanvas');
            spyOn(ClockService.prototype, 'resetTimer');
            spyOn(socketService, 'subscribeImages').and.callFake((callback) => {
                return callback(images);
            });
        });
        it('should not call drawOnCanvasNumberArray if the canvases are not initialized', () => {
            const spy = spyOn(BackgroundCanvasComponent.prototype, 'drawOnCanvasNumberArray');
            service['originalCanvas'] = undefined as unknown as BackgroundCanvasComponent;
            service['modifiedCanvas'] = undefined as unknown as BackgroundCanvasComponent;
            service['configureImages']();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should  call drawOnCanvasNumberArray if the canvases are initialized', () => {
            const spy = spyOn(BackgroundCanvasComponent.prototype, 'drawOnCanvasNumberArray');
            service['originalCanvas'] = new BackgroundCanvasComponent();
            service['modifiedCanvas'] = new BackgroundCanvasComponent();
            service['configureImages']();
            expect(spy).toHaveBeenCalledTimes(2);
        });
    });

    describe('congratulatePlayer', () => {
        it('should properly end the game after closing the dialog', () => {
            service.playerName = 'Jean';
            const routerSpy = spyOn(service['router'], 'navigate');
            service.game = stubGame;
            spyOn(MatDialog.prototype, 'open').and.returnValue({
                afterClosed: () => of({}),
            } as MatDialogRef<CongratulationsDialogComponent>);
            service['congratulatePlayer']('Jean', { ranking: PlayerRanking.First, time: 5 }, true);
            expect(routerSpy).toHaveBeenCalledWith(['home']);
        });
        it('should emit the proper end game event', () => {
            service.playerName = 'Jean';
            const spy = spyOn(service['clockService'], 'getFormattedTime');
            service.game = stubGame;
            service['congratulatePlayer']('', { ranking: PlayerRanking.None, time: 54 }, true);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('threatenBan', () => {
        it('should properly open a threat dialog', () => {
            service['game'] = {
                id: 0,
                name: '',
                url: '',
                solo: undefined as unknown as Ranking[],
                multiplayer: undefined as unknown as Ranking[],
                differenceCount: 0,
            };
            const spy = spyOn(MatDialog.prototype, 'open').and.returnValue({
                afterClosed: () => of({}),
            } as MatDialogRef<CongratulationsDialogComponent>);
            service.threatenBan();
            expect(spy).toHaveBeenCalled();
        });
        it('should properly open a threat dialog', () => {
            service['game'] = {
                id: 0,
                name: '',
                url: '',
                solo: undefined as unknown as Ranking[],
                multiplayer: undefined as unknown as Ranking[],
                differenceCount: 0,
            };
            const spy = spyOn(MatDialog.prototype, 'open').and.returnValue({
                afterClosed: () => of({}),
            } as MatDialogRef<CongratulationsDialogComponent>);
            service.threatenBan('hello');
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('findNewModifiedImage', () => {
        it('should call setRGBAValues the right amount of times', () => {
            service.setCanvas(CanvasId.ORIGINAL, new BackgroundCanvasComponent());
            service.setCanvas(CanvasId.MODIFIED, new BackgroundCanvasComponent());
            const spy = spyOn<any>(service, 'setRGBAValues');
            spyOn(BackgroundCanvasComponent.prototype, 'getImageData').and.returnValue(new ImageData(100, 100));
            spyOn<any>(service, 'blinkImages');
            service['findNewModifiedImage']([0, 1, 2, 3, 4]);
            expect(spy).toHaveBeenCalledTimes(10);
        });
    });

    describe('setRGBAValues', () => {
        it('should', () => {
            const imageToCopy: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
            const imageCopy: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            service['setRGBAValues'](4, imageCopy, imageToCopy);
            expect(imageCopy).toEqual([0, 0, 0, 0, 4, 5, 6, 7, 0, 0, 0, 0]);
        });
    });

    describe('blinkImages', () => {
        it('should call getImageData once for modified canvas', () => {
            service.setCanvas(CanvasId.ORIGINAL, new BackgroundCanvasComponent());
            service.setCanvas(CanvasId.MODIFIED, new BackgroundCanvasComponent());
            const image: number[] = [1, 2, 3];
            const spy = spyOn(BackgroundCanvasComponent.prototype, 'getImageData');
            spyOn(window, 'setTimeout');
            spyOn(BackgroundCanvasComponent.prototype, 'drawOnCanvasNumberArray');
            spyOn(BackgroundCanvasComponent.prototype, 'drawOnCanvasImageData');
            service['blinkImages']({ newOriginal: image, newModified: image, oldOriginal: image });
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should call drawOnCanvasNumberArray 11 times on canvases', () => {
            service.setCanvas(CanvasId.ORIGINAL, new BackgroundCanvasComponent());
            service.setCanvas(CanvasId.MODIFIED, new BackgroundCanvasComponent());
            const image: number[] = [1, 2, 3];
            const spy = spyOn(BackgroundCanvasComponent.prototype, 'drawOnCanvasNumberArray');
            spyOn(BackgroundCanvasComponent.prototype, 'getImageData');
            spyOn(BackgroundCanvasComponent.prototype, 'drawOnCanvasImageData');
            jasmine.clock().install();
            service['blinkImages']({ newOriginal: image, newModified: image, oldOriginal: image });
            jasmine.clock().tick(2000);
            expect(spy).toHaveBeenCalledTimes(11);
            jasmine.clock().uninstall();
        });

        it('should call drawOnCanvasImageData 3 times on canvases', () => {
            service.setCanvas(CanvasId.ORIGINAL, new BackgroundCanvasComponent());
            service.setCanvas(CanvasId.MODIFIED, new BackgroundCanvasComponent());
            const image: number[] = [1, 2, 3];
            const spy = spyOn(BackgroundCanvasComponent.prototype, 'drawOnCanvasImageData');
            spyOn(BackgroundCanvasComponent.prototype, 'drawOnCanvasNumberArray');
            spyOn(BackgroundCanvasComponent.prototype, 'getImageData');
            jasmine.clock().install();
            service['blinkImages']({ newOriginal: image, newModified: image, oldOriginal: image });
            jasmine.clock().tick(2000);
            expect(spy).toHaveBeenCalledTimes(3);
            jasmine.clock().uninstall();
        });
    });

    describe('recursiveBlinks', () => {
        it('should not blink in limitedGameMode ', () => {
            service.setCanvas(CanvasId.ORIGINAL, new BackgroundCanvasComponent());
            service.setCanvas(CanvasId.MODIFIED, new BackgroundCanvasComponent());
            const image: number[] = [1, 2, 3];
            const spy = spyOn(BackgroundCanvasComponent.prototype, 'drawOnCanvasImageData');
            spyOn(BackgroundCanvasComponent.prototype, 'drawOnCanvasNumberArray');
            spyOn(BackgroundCanvasComponent.prototype, 'getImageData');
            service.isLimited = true;
            jasmine.clock().install();
            service['blinkImages']({ newOriginal: image, newModified: image, oldOriginal: image });
            jasmine.clock().tick(2000);
            expect(spy).not.toHaveBeenCalledTimes(3);
            jasmine.clock().uninstall();
        });
    });
});
