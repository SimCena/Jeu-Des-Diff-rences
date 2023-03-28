/* eslint-disable no-restricted-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChildrenOutletContexts, UrlSerializer } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameHandlerService } from '@app/services/game-handler.service';
import { MultiGameRunnerService } from '@app/services/game-runner/multi-game-runner.service';
import { SocketService } from '@app/services/socket.service';
import { BackgroundCanvasComponent } from '../background-canvas/background-canvas.component';
import { ChatBoxComponent } from '../chat-box/chat-box.component';
import { CheatingCanvasesComponent } from '../cheating-canvases/cheating-canvases.component';
import { MultiplayerInterfaceComponent } from './multiplayer-interface.component';

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
}

@Injectable({
    providedIn: 'root',
})
class MockMultiGameRunnerService extends MultiGameRunnerService {
    initSocketSubscriptions(): void {
        return;
    }
}

@Injectable({
    providedIn: 'root',
})
class MockGameHandlerService extends GameHandlerService {}

describe('MultiplayerInterfaceComponent', () => {
    let socketService: SocketService;
    let component: MultiplayerInterfaceComponent;
    let gameRunnerService: MultiGameRunnerService;
    let gameHandlerService: GameHandlerService;
    let fixture: ComponentFixture<MultiplayerInterfaceComponent>;
    let socketAliveSpy: jasmine.Spy;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MultiplayerInterfaceComponent, ChatBoxComponent, CheatingCanvasesComponent, BackgroundCanvasComponent],
            imports: [AppMaterialModule, RouterTestingModule, BrowserAnimationsModule, CommonModule, HttpClientTestingModule, ReactiveFormsModule],
            providers: [
                UrlSerializer,
                { provide: SocketService, useClass: MockSocketService },
                { provide: MultiGameRunnerService, useClass: MockMultiGameRunnerService },
                { provide: GameHandlerService, useClass: MockGameHandlerService },
                ChildrenOutletContexts,
            ],
        }).compileComponents();

        gameRunnerService = TestBed.inject(MultiGameRunnerService);
        gameHandlerService = TestBed.inject(GameHandlerService);
        socketService = TestBed.inject(SocketService);
        fixture = TestBed.createComponent(MultiplayerInterfaceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        socketAliveSpy = spyOn(socketService, 'isSocketAlive').and.returnValue(false);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('constructor', () => {
        it('should set gameHasStarted to false', () => {
            expect(gameHandlerService.gameHasStarted).toBeFalse();
        });
    });

    describe('ngOnInit', () => {
        beforeEach(() => {
            socketAliveSpy.and.returnValue(true);
        });
        it('should not call anything if socket not alive', () => {
            socketAliveSpy.and.returnValue(false);
            const spy = spyOn(gameRunnerService, 'initSocketSubscriptions');

            component.ngOnInit();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should call initGame', () => {
            const spy = spyOn(gameRunnerService, 'initGame');
            spyOn(gameRunnerService, 'initSocketSubscriptions');
            spyOn(gameRunnerService, 'configureKeyToggle');
            spyOn(gameRunnerService, 'setPlayerInfo');

            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
        it('should call initSocketSubscription', () => {
            const spy = spyOn(gameRunnerService, 'initSocketSubscriptions');
            spyOn(gameRunnerService, 'initGame');
            spyOn(gameRunnerService, 'configureKeyToggle');
            spyOn(gameRunnerService, 'setPlayerInfo');

            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
        it('should call configureKeyToggle', () => {
            const spy = spyOn(gameRunnerService, 'configureKeyToggle');
            spyOn(gameRunnerService, 'initSocketSubscriptions');
            spyOn(gameRunnerService, 'initGame');
            spyOn(gameRunnerService, 'setPlayerInfo');

            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
        it('should call setPlayerInfo', () => {
            const spy = spyOn(gameRunnerService, 'setPlayerInfo');
            spyOn(gameRunnerService, 'initSocketSubscriptions');
            spyOn(gameRunnerService, 'configureKeyToggle');
            spyOn(gameRunnerService, 'initGame');

            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy', () => {
        beforeEach(() => {
            socketAliveSpy.and.returnValue(true);
        });
        it('should not call anything if socket not alive', () => {
            const spy = spyOn(socketService, 'unsubscribeOpponentName');
            expect(spy).not.toHaveBeenCalled();
        });
        it('should abandon multiplayer game if opponent is still there', () => {
            component['gameRunnerService'].opponentStillThere = true;
            component['gameHandlerService'].playerName = 'test';
            const spy = spyOn(socketService, 'abandonMultiplayerRoom');

            component.ngOnDestroy();
            expect(spy).toHaveBeenCalledTimes(1);
        });
        it('should close the game if opponent is not there anymore', () => {
            component['gameRunnerService'].opponentStillThere = false;
            const spy = spyOn(socketService, 'leaveGameRoom');

            component.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
        it('should call unsubscribeOpponentName if socketAlive', () => {
            const spy = spyOn<any>(socketService, 'unsubscribeOpponentName');

            component.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
        it('should call unsubscribeGameSocketFeatures if socketAlive', () => {
            const spy = spyOn<any>(socketService, 'unsubscribeGameSocketFeatures');

            component.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
    });

    afterEach(() => {
        fixture.destroy();
    });
});
