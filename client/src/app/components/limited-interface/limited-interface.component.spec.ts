/* eslint-disable max-classes-per-file */
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UrlSerializer, ChildrenOutletContexts } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatBoxComponent } from '@app/components/chat-box/chat-box.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameHandlerService } from '@app/services/game-handler.service';
import { MultiGameRunnerService } from '@app/services/game-runner/multi-game-runner.service';
import { SocketService } from '@app/services/socket.service';

import { LimitedInterfaceComponent } from '@app/components/limited-interface/limited-interface.component';
import { Injectable } from '@angular/core';
import { LimitedGameRunnerService } from '@app/services/game-runner/limited-game-runner.service';
import { CheatingCanvasesComponent } from '@app/components/cheating-canvases/cheating-canvases.component';
import { BackgroundCanvasComponent } from '@app/components/background-canvas/background-canvas.component';

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
    unsubscribeMultiplayerSocketFeatures(): void {
        return;
    }
    unsubscribeMessageSent(): void {
        return;
    }
    unsubscribeOpponentName(): void {
        return;
    }
    unsubscribeParticipantLeft(): void {
        return;
    }
    isSocketAlive(): boolean {
        return true;
    }
    leaveGameRoom(): void {
        return;
    }
    unsubscribeGameSocketFeatures(): void {
        return;
    }
    unsubscribeLimitedGameEvents(): void {
        return;
    }
    subscribeLimitedGameDone(): void {
        return;
    }
    subscribePlayerWonGame(): void {
        return;
    }
}

@Injectable({
    providedIn: 'root',
})
class MockMultiGameRunnerService extends MultiGameRunnerService {}

@Injectable({
    providedIn: 'root',
})
class MockLimitedGameRunnerService extends LimitedGameRunnerService {}

@Injectable({
    providedIn: 'root',
})
class MockGameHandlerService extends GameHandlerService {}

describe('LimitedInterfaceComponent', () => {
    let component: LimitedInterfaceComponent;
    let fixture: ComponentFixture<LimitedInterfaceComponent>;
    let multiGameRunnerService: MultiGameRunnerService;
    let limitedGameRunnerService: LimitedGameRunnerService;
    let socketService: SocketService;
    let gameHandlerService: GameHandlerService;
    let socketAliveSpy: jasmine.Spy;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LimitedInterfaceComponent, ChatBoxComponent, CheatingCanvasesComponent, BackgroundCanvasComponent],
            imports: [AppMaterialModule, RouterTestingModule, BrowserAnimationsModule, CommonModule, HttpClientTestingModule, ReactiveFormsModule],
            providers: [
                UrlSerializer,
                { provide: SocketService, useClass: MockSocketService },
                { provide: MultiGameRunnerService, useClass: MockMultiGameRunnerService },
                { provide: LimitedGameRunnerService, useClass: MockLimitedGameRunnerService },
                { provide: GameHandlerService, useClass: MockGameHandlerService },
                ChildrenOutletContexts,
            ],
        }).compileComponents();

        multiGameRunnerService = TestBed.inject(MultiGameRunnerService);
        limitedGameRunnerService = TestBed.inject(LimitedGameRunnerService);
        socketService = TestBed.inject(SocketService);
        gameHandlerService = TestBed.inject(GameHandlerService);
        fixture = TestBed.createComponent(LimitedInterfaceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        socketAliveSpy = spyOn(socketService, 'isSocketAlive').and.returnValue(false);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('constructor', () => {
        it('should set gameHasStarted to false on gameHandlerService', () => {
            expect(gameHandlerService.gameHasStarted).toBeFalse();
        });
    });

    describe('ngOnInit', () => {
        it('should not do anything if socket not alive', () => {
            const spy = spyOn(limitedGameRunnerService, 'initSocketSubscriptions');

            component.ngOnInit();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should call initSocketSubscribtion on LimitedGameRunnerService', () => {
            socketAliveSpy.and.returnValue(true);
            const spy = spyOn(limitedGameRunnerService, 'initSocketSubscriptions');

            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
        it('should call initGame on LimitedGameRunnerService', () => {
            socketAliveSpy.and.returnValue(true);
            const spy = spyOn(limitedGameRunnerService, 'initGame');

            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
        it('should call configureKeyToggles on LimitedGameRunnerService', () => {
            socketAliveSpy.and.returnValue(true);
            const spy = spyOn(limitedGameRunnerService, 'configureKeyToggles');

            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
        it('should call setPlayerInfo on MultiGameRunnerService', () => {
            socketAliveSpy.and.returnValue(true);
            const spy = spyOn(multiGameRunnerService, 'setPlayerInfo');

            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy', () => {
        it('should not do anything if socket not alive', () => {
            const spy = spyOn(socketService, 'unsubscribeGameSocketFeatures');

            component.ngOnDestroy();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should call unsubscribeGameSocketFeatures on socketService', () => {
            socketAliveSpy.and.returnValue(true);
            const spy = spyOn(socketService, 'unsubscribeGameSocketFeatures');

            component.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
        it('should call abandonLimitedGameRoom on socketService if game not solo', () => {
            socketAliveSpy.and.returnValue(true);
            spyOn(limitedGameRunnerService, 'isSolo').and.returnValue(false);
            const spy = spyOn(socketService, 'abandonLimitedGameRoom');

            component.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
        it('should call deleteSoloGame on socketService if game solo', () => {
            socketAliveSpy.and.returnValue(true);
            spyOn(limitedGameRunnerService, 'isSolo').and.returnValue(true);
            const spy = spyOn(socketService, 'deleteSoloGame');

            component.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
    });
});
