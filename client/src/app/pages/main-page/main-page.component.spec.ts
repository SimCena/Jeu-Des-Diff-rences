/* eslint-disable max-lines */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppMaterialModule } from '@app/modules/material.module';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { SocketService } from '@app/services/socket.service';
import { Coordinate } from '@common/coordinate';
import { LOGO_ROTATION_SCALING_FACTOR } from '@app/constants/constants';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { LimitedGameDialogComponent } from '@app/components/limited-game-dialog/limited-game-dialog.component';
import { ChildrenOutletContexts, UrlSerializer } from '@angular/router';
import { GameRequestsService } from '@app/services/game-requests.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { GameHandlerService } from '@app/services/game-handler.service';
import { LimitedGameChoice } from '@app/interfaces/limited-game-value';
import { LimitedGameRunnerService } from '@app/services/game-runner/limited-game-runner.service';
import { Ranking } from '@common/games';

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
    connect(): void {
        return;
    }
    isSocketAlive(): boolean {
        return true;
    }
}

@Injectable({
    providedIn: 'root',
})
class MockGameRequestsService extends GameRequestsService {}

@Injectable({
    providedIn: 'root',
})
class MockGameHandlerService extends GameHandlerService {}

@Injectable({
    providedIn: 'root',
})
class MockLimitedGameRunnerService extends LimitedGameRunnerService {}

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let socketService: SocketService;
    let gameRunner: LimitedGameRunnerService;
    let gameRequestsService: GameRequestsService;
    let gameHandlerService: GameHandlerService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                AppMaterialModule,
                CommonModule,
                BrowserAnimationsModule,
                RouterTestingModule,
                FormsModule,
                ReactiveFormsModule,
            ],
            declarations: [LimitedGameDialogComponent],
            providers: [
                { provide: SocketService, useClass: MockSocketService },
                { provide: LimitedGameRunnerService, useClass: MockLimitedGameRunnerService },
                { provide: GameRequestsService, useClass: MockGameRequestsService },
                { provide: GameHandlerService, useClass: MockGameHandlerService },
                UrlSerializer,
                ChildrenOutletContexts,
            ],
        }).compileComponents();

        gameRunner = TestBed.inject(LimitedGameRunnerService);
        gameHandlerService = TestBed.inject(GameHandlerService);
        gameRequestsService = TestBed.inject(GameRequestsService);
        socketService = TestBed.inject(SocketService);
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        gameRequestsService.games = [
            { id: 0, name: '', url: '', solo: undefined as unknown as Ranking[], multiplayer: undefined as unknown as Ranking[], differenceCount: 0 },
        ];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit()', () => {
        it('should call connect if socket is not alive', () => {
            const spy = spyOn(socketService, 'connect');
            spyOn(socketService, 'isSocketAlive').and.returnValue(false);
            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
        it('should not call connect if socket is alive', () => {
            const spy = spyOn(socketService, 'connect');
            spyOn(socketService, 'isSocketAlive').and.returnValue(true);
            component.ngOnInit();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('ngAfterViewInit()', () => {
        it('defines windowWidth', () => {
            expect(component['windowWidth']).toBeTruthy();
        });
        it('defines windowHeight', () => {
            expect(component['windowHeight']).toBeTruthy();
        });
    });

    describe('selectLimitedGame', () => {
        it('should call open on the dialog', () => {
            spyOn<any>(component, 'selectLimitedGame').and.callFake(() => {
                return;
            });
            const spy = spyOn<any>(component['dialog'], 'open');

            component['selectLimitedGame']();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should change playerName on gameHandler if name exists', () => {
            spyOn(MatDialog.prototype, 'open').and.returnValue({
                beforeClosed: () => of({ name: 'test', choice: LimitedGameChoice.Cancel }),
            } as MatDialogRef<LimitedGameDialogComponent>);

            component['selectLimitedGame']();
            expect(gameHandlerService.playerName).toEqual('test');
        });
        it('should do the right calls if choice is solo game', () => {
            spyOn(MatDialog.prototype, 'open').and.returnValue({
                beforeClosed: () => of({ name: 'test', choice: LimitedGameChoice.Solo }),
            } as MatDialogRef<LimitedGameDialogComponent>);
            const createGameSpy = spyOn(socketService, 'createSoloGame');
            const subscribeLimitedGameSpy = spyOn(socketService, 'subscribeLimitedGameId');
            const setLimitedGameModeSpy = spyOn(socketService, 'setLimitedGameMode');

            component['selectLimitedGame']();
            expect(createGameSpy).toHaveBeenCalledWith(0);
            expect(subscribeLimitedGameSpy).toHaveBeenCalled();
            expect(setLimitedGameModeSpy).toHaveBeenCalled();
        });
        it('should not do the right calls if choice is solo game and no games exist', () => {
            spyOn(MatDialog.prototype, 'open').and.returnValue({
                beforeClosed: () => of({ name: 'test', choice: LimitedGameChoice.Solo }),
            } as MatDialogRef<LimitedGameDialogComponent>);
            gameRequestsService.games = [];
            const createGameSpy = spyOn(socketService, 'createSoloGame');
            const subscribeLimitedGameSpy = spyOn(socketService, 'subscribeLimitedGameId');
            const setLimitedGameModeSpy = spyOn(socketService, 'setLimitedGameMode');

            component['selectLimitedGame']();
            expect(createGameSpy).not.toHaveBeenCalledWith(0);
            expect(subscribeLimitedGameSpy).not.toHaveBeenCalled();
            expect(setLimitedGameModeSpy).not.toHaveBeenCalled();
        });
        it('should launch game on game requests service when receiving the id', () => {
            spyOn(MatDialog.prototype, 'open').and.returnValue({
                beforeClosed: () => of({ name: 'test', choice: LimitedGameChoice.Solo }),
            } as MatDialogRef<LimitedGameDialogComponent>);
            spyOn(socketService, 'subscribeLimitedGameId').and.callFake((callback) => {
                return callback(3);
            });
            const spy = spyOn(gameRequestsService, 'launchGame');

            component['selectLimitedGame']();
            expect(spy).toHaveBeenCalledWith(3, true);
        });
        it('should set the game choice on the limitedGameRunner', () => {
            spyOn(MatDialog.prototype, 'open').and.returnValue({
                beforeClosed: () => of({ name: 'test', choice: LimitedGameChoice.Solo }),
            } as MatDialogRef<LimitedGameDialogComponent>);

            component['selectLimitedGame']();
            expect(gameRunner.gameType).toEqual(LimitedGameChoice.Solo);
        });
        it('should do the right calls if choice is coop game', () => {
            spyOn(MatDialog.prototype, 'open').and.returnValue({
                beforeClosed: () => of({ name: 'test', choice: LimitedGameChoice.Coop }),
            } as MatDialogRef<LimitedGameDialogComponent>);
            const subscribeLimitedGameSpy = spyOn(socketService, 'subscribeLimitedGameId');
            const subscribeRoomJoinedSpy = spyOn(socketService, 'subscribeRoomJoined');
            const subscribeJoinLimitedSpy = spyOn(socketService, 'joinLimitedRoom');

            component['selectLimitedGame']();
            expect(subscribeLimitedGameSpy).toHaveBeenCalled();
            expect(subscribeRoomJoinedSpy).toHaveBeenCalled();
            expect(subscribeJoinLimitedSpy).toHaveBeenCalled();
        });
        it('should do the right calls if choice is solo game', () => {
            spyOn(MatDialog.prototype, 'open').and.returnValue({
                beforeClosed: () => of({ name: 'test', choice: LimitedGameChoice.Coop }),
            } as MatDialogRef<LimitedGameDialogComponent>);
            spyOn(socketService, 'subscribeLimitedGameId').and.callFake((callback) => {
                return callback(3);
            });
            const spy = spyOn(gameRequestsService, 'launchLimitedWaitingRoom');

            component['selectLimitedGame']();
            expect(spy).toHaveBeenCalledWith(3);
        });
        it('should do the right calls if choice is solo game', () => {
            spyOn(MatDialog.prototype, 'open').and.returnValue({
                beforeClosed: () => of({ name: 'test', choice: LimitedGameChoice.Coop }),
            } as MatDialogRef<LimitedGameDialogComponent>);
            spyOn(socketService, 'subscribeRoomJoined').and.callFake((callback) => {
                return callback();
            });
            const spy = spyOn(gameRequestsService, 'launchMultiplayerGame');

            component['selectLimitedGame']();
            expect(spy).toHaveBeenCalledWith(true);
        });
        it('should set the game choice on the limitedGameRunner if solo game', () => {
            spyOn(MatDialog.prototype, 'open').and.returnValue({
                beforeClosed: () => of({ name: 'test', choice: LimitedGameChoice.Coop }),
            } as MatDialogRef<LimitedGameDialogComponent>);

            component['selectLimitedGame']();
            expect(gameRunner.gameType).toEqual(LimitedGameChoice.Coop);
        });
        it('should not do anything if case default', () => {
            spyOn(MatDialog.prototype, 'open').and.returnValue({
                beforeClosed: () => of({ name: 'test', choice: undefined }),
            } as MatDialogRef<LimitedGameDialogComponent>);
            const createSoloGameSpy = spyOn(socketService, 'createSoloGame');
            const subscribeLimitedGameId = spyOn(socketService, 'subscribeLimitedGameId');

            component['selectLimitedGame']();
            expect(createSoloGameSpy).not.toHaveBeenCalled();
            expect(subscribeLimitedGameId).not.toHaveBeenCalled();
        });
    });

    describe('startSoloLimitedGame', () => {
        describe('no games exists', () => {
            beforeEach(() => {
                spyOn(gameRequestsService, 'hasGames').and.returnValue(false);
            });
            it('should open the snackbar', () => {
                const spy = spyOn(component['snackBar'], 'open');

                component['startSoloLimitedGame']();
                expect(spy).toHaveBeenCalled();
            });
        });
        describe('games available', () => {
            beforeEach(() => {
                spyOn(gameRequestsService, 'hasGames').and.returnValue(true);
            });
            it('should call createSoloGame on the socket service', () => {
                const spy = spyOn(socketService, 'createSoloGame');

                component['startSoloLimitedGame']();
                expect(spy).toHaveBeenCalled();
            });
            it('should call subscribeLimitedGameId on socket service', () => {
                const spy = spyOn(socketService, 'subscribeLimitedGameId');

                component['startSoloLimitedGame']();
                expect(spy).toHaveBeenCalled();
            });
            it('should call launchGame on game requests service when receiving limited game id', () => {
                spyOn(socketService, 'subscribeLimitedGameId').and.callFake((callback) => {
                    return callback(2);
                });
                const spy = spyOn(gameRequestsService, 'launchGame');

                component['startSoloLimitedGame']();
                expect(spy).toHaveBeenCalledWith(2, true);
            });
            it('should call subscribeLimitedGameMode on socket service', () => {
                const spy = spyOn(socketService, 'setLimitedGameMode');

                component['startSoloLimitedGame']();
                expect(spy).toHaveBeenCalled();
            });
            it('should set gameType to Solo on limitedGameRunner', () => {
                component['startSoloLimitedGame']();
                expect(gameRunner.gameType).toBe(LimitedGameChoice.Solo);
            });
        });
    });

    describe('startCoopLimitedGame', () => {
        describe('no games exists', () => {
            beforeEach(() => {
                spyOn(gameRequestsService, 'hasGames').and.returnValue(false);
            });
            it('should open the snackbar', () => {
                const spy = spyOn(component['snackBar'], 'open');

                component['startCoopLimitedGame']();
                expect(spy).toHaveBeenCalled();
            });
        });
        describe('games available', () => {
            beforeEach(() => {
                spyOn(gameRequestsService, 'hasGames').and.returnValue(true);
            });
            it('should call subscribeLimitedGameId on socket service', () => {
                const spy = spyOn(socketService, 'subscribeLimitedGameId');

                component['startCoopLimitedGame']();
                expect(spy).toHaveBeenCalled();
            });
            it('should call launchGame on game requests service when receiving limited game id', () => {
                spyOn(socketService, 'subscribeLimitedGameId').and.callFake((callback) => {
                    return callback(3);
                });
                const spy = spyOn(gameRequestsService, 'launchLimitedWaitingRoom');

                component['startCoopLimitedGame']();
                expect(spy).toHaveBeenCalledWith(3);
            });
            it('should call subscribeRoomJoined on the socket service', () => {
                const spy = spyOn(socketService, 'subscribeRoomJoined');

                component['startCoopLimitedGame']();
                expect(spy).toHaveBeenCalled();
            });
            it('should call launchGame on game requests service when receiving limited game id', () => {
                spyOn(socketService, 'subscribeRoomJoined').and.callFake((callback) => {
                    return callback();
                });
                const spy = spyOn(gameRequestsService, 'launchMultiplayerGame');

                component['startCoopLimitedGame']();
                expect(spy).toHaveBeenCalledWith(true);
            });
            it('should call joinLimitedRoom on socket service', () => {
                gameHandlerService.playerName = 'testName';
                const spy = spyOn(socketService, 'joinLimitedRoom');

                component['startCoopLimitedGame']();
                expect(spy).toHaveBeenCalledWith(gameHandlerService.playerName);
            });
            it('should set gameType to Solo on limitedGameRunner', () => {
                component['startCoopLimitedGame']();
                expect(gameRunner.gameType).toBe(LimitedGameChoice.Coop);
            });
        });
    });

    describe('configureModifiedDatabase', () => {
        it('should call subscribtionModifiedDatabase on socket service', () => {
            const spy = spyOn(socketService, 'subscribeModifiedDatabase');

            component['configureModifiedDatabase']();
            expect(spy).toHaveBeenCalled();
        });
        it('should get games when database is modified', () => {
            spyOn(socketService, 'subscribeModifiedDatabase').and.callFake((callback) => {
                return callback();
            });
            const spy = spyOn(gameRequestsService, 'getGames');

            component['configureModifiedDatabase']();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('mouseMove', () => {
        let mouseEvent: MouseEvent;
        let spy: jasmine.Spy<() => void>;

        beforeEach(() => {
            mouseEvent = {
                x: 1,
                y: 2,
            } as MouseEvent;

            spy = spyOn<any>(component, 'rotateTitle');
            component['mouseMove'](mouseEvent);
        });

        it('should call rotateTitle()', () => {
            expect(spy).toHaveBeenCalled();
        });

        it('should update currentMousePosition', () => {
            expect(component['currentMousePosition']).toEqual(mouseEvent);
        });
    });

    describe('rotateTitle', () => {
        it('should call getRotation(1)', () => {
            const spy = spyOn<any>(component, 'getRotation');
            component['rotateTitle']();
            expect(spy).toHaveBeenCalledWith(1);
        });
        it("should update titleMesh rotation's with getRotation", () => {
            spyOn<any>(component, 'getRotation').and.callFake(() => {
                return [1, 1, 1];
            });
            component['rotateTitle']();
            expect(component['titleMesh'].rotation).toEqual([1, 1, 1]);
        });
    });

    describe('getRotation', () => {
        const MAX_ROTATION = 0.125;
        let mouseEvent: MouseEvent;

        beforeEach(() => {
            mouseEvent = {
                x: 1,
                y: 2,
            } as MouseEvent;

            spyOn<any>(component, 'rotateTitle');
            component['mouseMove'](mouseEvent);
            component['windowWidth'] = 1920;
            component['windowHeight'] = 1080;
        });

        it('should call getCenterRelativePosition', () => {
            const spy = spyOn<any>(component, 'getCenterRelativePosition').and.callThrough();
            component['getRotation'](1);
            expect(spy).toHaveBeenCalled();
        });

        it('should call normalizeRotation', () => {
            const spy = spyOn<any>(component, 'normalizeRotation').and.callThrough();
            component['getRotation'](1);
            expect(spy).toHaveBeenCalled();
        });

        it('should call scaleRotation', () => {
            const spy = spyOn<any>(component, 'scaleRotation').and.callThrough();
            component['getRotation'](1);
            expect(spy).toHaveBeenCalled();
        });

        it('should have a rotation of 0 in the center of the screen', () => {
            mouseEvent = {
                x: 960,
                y: 540,
            } as MouseEvent;
            component['mouseMove'](mouseEvent);
            expect(component['getRotation'](1)).toEqual([0, 0, 0]);
        });

        it('should return the right value in the top-left corner', () => {
            mouseEvent = {
                x: 0,
                y: 0,
            } as MouseEvent;
            component['mouseMove'](mouseEvent);
            expect(component['getRotation'](1)).toEqual([-MAX_ROTATION, -MAX_ROTATION, 0]);
        });

        it('should return the right value in the top-right corner', () => {
            mouseEvent = {
                x: 1920,
                y: 0,
            } as MouseEvent;
            component['mouseMove'](mouseEvent);
            expect(component['getRotation'](1)).toEqual([-MAX_ROTATION, MAX_ROTATION, 0]);
        });

        it('should return the right value in the bottom-left corner', () => {
            mouseEvent = {
                x: 0,
                y: 1080,
            } as MouseEvent;
            component['mouseMove'](mouseEvent);
            expect(component['getRotation'](1)).toEqual([MAX_ROTATION, -MAX_ROTATION, 0]);
        });

        it('should return the right value in the bottom-right corner', () => {
            mouseEvent = {
                x: 1920,
                y: 1080,
            } as MouseEvent;
            component['mouseMove'](mouseEvent);
            expect(component['getRotation'](1)).toEqual([MAX_ROTATION, MAX_ROTATION, 0]);
        });
    });

    describe('scaleRotation', () => {
        it('should scale to 0 with no rotation', () => {
            expect(component['scaleRotation']({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
        });

        it('should scale to 1 with rotation of 8', () => {
            expect(component['scaleRotation']({ x: 8, y: 8 })).toEqual({ x: 1, y: 1 });
        });

        it('should scale according to the ROTATION_SCALING_FACTOR', () => {
            const testValue = 171;
            const expectedValue: Coordinate = {
                x: testValue / LOGO_ROTATION_SCALING_FACTOR,
                y: testValue / LOGO_ROTATION_SCALING_FACTOR,
            };
            expect(component['scaleRotation']({ x: 171, y: 171 })).toEqual(expectedValue);
        });

        it('should scale in the negatives', () => {
            expect(component['scaleRotation']({ x: -8, y: -8 })).toEqual({ x: -1, y: -1 });
        });
    });

    describe('normalizeRotation', () => {
        const NEGATIVE_FACTOR = -1;

        beforeEach(() => {
            component['windowWidth'] = 1920;
            component['windowHeight'] = 1080;
        });

        it('should normalize to 1 if at center of screen', () => {
            const screenCenter: Coordinate = { x: 960, y: 540 };
            expect(component['normalizeRotation'](screenCenter, 1)).toEqual({ x: 1, y: 1 });
        });

        it('should normalize to 0 if at top-left of screen', () => {
            const position: Coordinate = { x: 0, y: 0 };
            expect(component['normalizeRotation'](position, 1)).toEqual({ x: 0, y: 0 });
        });

        it('should normalize to 2, 0 if at top-right of screen', () => {
            const position: Coordinate = { x: 1920, y: 0 };
            expect(component['normalizeRotation'](position, 1)).toEqual({ x: 2, y: 0 });
        });

        it('should normalize to 0, 2 if at bottom-left of screen', () => {
            const position: Coordinate = { x: 0, y: 1080 };
            expect(component['normalizeRotation'](position, 1)).toEqual({ x: 0, y: 2 });
        });

        it('should normalize to 2, 2 if at bottom-right of screen', () => {
            const position: Coordinate = { x: 1920, y: 1080 };
            expect(component['normalizeRotation'](position, 1)).toEqual({ x: 2, y: 2 });
        });

        it('should normalize to -1 if at center of screen with negative factor', () => {
            const position: Coordinate = { x: 960, y: 540 };
            expect(component['normalizeRotation'](position, NEGATIVE_FACTOR)).toEqual({ x: -1, y: -1 });
        });

        it('should normalize to -0 if at top-left of screen with negative factor', () => {
            const position: Coordinate = { x: 0, y: 0 };
            expect(component['normalizeRotation'](position, NEGATIVE_FACTOR)).toEqual({ x: -0, y: -0 });
        });

        it('should normalize to -2, -0 if at top-right of screen with negative factor', () => {
            const position: Coordinate = { x: 1920, y: 0 };
            expect(component['normalizeRotation'](position, NEGATIVE_FACTOR)).toEqual({ x: -2, y: -0 });
        });

        it('should normalize to -0, -2 if at bottom-left of screen with negative factor', () => {
            const position: Coordinate = { x: 0, y: 1080 };
            expect(component['normalizeRotation'](position, NEGATIVE_FACTOR)).toEqual({ x: -0, y: -2 });
        });

        it('should normalize to -2, -2 if at bottom-right of screen with negative factor', () => {
            const position: Coordinate = { x: 1920, y: 1080 };
            expect(component['normalizeRotation'](position, NEGATIVE_FACTOR)).toEqual({ x: -2, y: -2 });
        });

        it('should scale rotation with factor', () => {
            const FACTOR = 4;
            const position: Coordinate = { x: 1920, y: 1080 };
            expect(component['normalizeRotation'](position, FACTOR)).toEqual({ x: 8, y: 8 });
        });
    });

    describe('getCenterRelativePosition', () => {
        beforeEach(() => {
            component['windowWidth'] = 1920;
            component['windowHeight'] = 1080;
        });

        it('should return a position of 0 in the center of the screen', () => {
            const screenCenter: Coordinate = { x: 960, y: 540 };
            expect(component['getCenterRelativePosition'](screenCenter)).toEqual({ x: 0, y: 0 });
        });

        it('should return a position of -960, -540 in the top-left of the screen', () => {
            const position: Coordinate = { x: 0, y: 0 };
            expect(component['getCenterRelativePosition'](position)).toEqual({
                x: -960,
                y: -540,
            });
        });

        it('should return a position of -960, 540 in the bottom-left of the screen', () => {
            const position: Coordinate = { x: 0, y: 1080 };
            expect(component['getCenterRelativePosition'](position)).toEqual({
                x: -960,
                y: 540,
            });
        });

        it('should return a position of 960, -540 in the top-right of the screen', () => {
            const position: Coordinate = { x: 1920, y: 0 };
            expect(component['getCenterRelativePosition'](position)).toEqual({
                x: 960,
                y: -540,
            });
        });

        it('should return a position of 960, 540 in the bottom-right of the screen', () => {
            const position: Coordinate = { x: 1920, y: 1080 };
            expect(component['getCenterRelativePosition'](position)).toEqual({
                x: 960,
                y: 540,
            });
        });
    });
});
