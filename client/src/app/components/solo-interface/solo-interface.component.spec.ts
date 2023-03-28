/* eslint-disable no-restricted-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChildrenOutletContexts, UrlSerializer } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/modules/material.module';
import { ClockService } from '@app/services/clock.service';
import { GameHandlerService } from '@app/services/game-handler.service';
import { GameRequestsService } from '@app/services/game-requests.service';
import { SoloGameRunnerService } from '@app/services/game-runner/solo-game-runner.service';
import { SocketService } from '@app/services/socket.service';
import { of } from 'rxjs';
import { BackgroundCanvasComponent } from '../background-canvas/background-canvas.component';
import { ChatBoxComponent } from '../chat-box/chat-box.component';
import { CheatingCanvasesComponent } from '../cheating-canvases/cheating-canvases.component';
import { NameInputDialogComponent } from '../name-input-dialog/name-input-dialog.component';

import { SoloInterfaceComponent } from './solo-interface.component';

@Injectable({
    providedIn: 'root',
})
class MockSocketService extends SocketService {
    on(): void {
        return;
    }
    off(): void {
        return;
    }
    send(): void {
        return;
    }
    isSocketAlive(): boolean {
        return true;
    }
    unsubscribeMessageSent(): void {
        return;
    }
    unsubscribeHostUpdates(): void {
        return;
    }
    unsubscribeParticipantUpdates(): void {
        return;
    }
    unsubscribeGameSocketFeatures(): void {
        return;
    }
}

@Injectable({
    providedIn: 'root',
})
class MockGameRequestsService extends GameRequestsService {
    abandonGame(): void {
        return;
    }
    launchMultiplayerGame(): void {
        return;
    }
}

@Injectable({
    providedIn: 'root',
})
class MockGameHandlerService extends GameHandlerService {}

@Injectable({
    providedIn: 'root',
})
class MockSoloGameRunnerService extends SoloGameRunnerService {}

describe('SoloInterfaceComponent', () => {
    let socketService: SocketService;
    let gameRunnerService: SoloGameRunnerService;
    let gameHandlerService: GameHandlerService;
    let component: SoloInterfaceComponent;
    let fixture: ComponentFixture<SoloInterfaceComponent>;
    let initPlayerNameSpy: jasmine.Spy<any>;
    let socketAliveSpy: jasmine.Spy<any>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SoloInterfaceComponent, ChatBoxComponent, NameInputDialogComponent, CheatingCanvasesComponent, BackgroundCanvasComponent],
            providers: [
                UrlSerializer,
                ChildrenOutletContexts,
                { provide: SocketService, useClass: MockSocketService },
                {
                    provide: GameRequestsService,
                    useClass: MockGameRequestsService,
                    import: CommonModule,
                },
                {
                    provide: SoloGameRunnerService,
                    useClass: MockSoloGameRunnerService,
                },
                {
                    provide: GameHandlerService,
                    useClass: MockGameHandlerService,
                },
                {
                    provide: ClockService,
                },
            ],
            imports: [AppMaterialModule, BrowserAnimationsModule, RouterTestingModule, HttpClientTestingModule, FormsModule, ReactiveFormsModule],
        }).compileComponents();

        gameRunnerService = TestBed.inject(SoloGameRunnerService);
        gameHandlerService = TestBed.inject(GameHandlerService);
        socketService = TestBed.inject(SocketService);
        fixture = TestBed.createComponent(SoloInterfaceComponent);
        component = fixture.componentInstance;

        socketAliveSpy = spyOn(socketService, 'isSocketAlive').and.returnValue(false);
        initPlayerNameSpy = spyOn<any>(component, 'initPlayerName').and.callFake(() => {
            return;
        });
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('constructor', () => {
        it('should set isMultiplayer on gameRunner to false', () => {
            expect(gameHandlerService.gameHasStarted).toBeFalse();
        });
    });

    describe('ngAfterViewInit', () => {
        it('should set gameHasStarted on gameRunner to false', () => {
            component.ngAfterViewInit();
            expect(gameHandlerService.gameHasStarted).toBeFalse();
        });
        it('should call initPlayerName', () => {
            component.ngAfterViewInit();
            expect(initPlayerNameSpy).toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy', () => {
        it('should call deleteSoloGame on socketService if the socket is alive', () => {
            socketAliveSpy.and.returnValue(true);
            const spy = spyOn(socketService, 'deleteSoloGame');

            component.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
            socketAliveSpy.and.returnValue(false);
        });
        it('should not call deleteSoloGame on socketService if the socket is not alive', () => {
            socketAliveSpy.and.returnValue(false);
            const spy = spyOn(socketService, 'deleteSoloGame');

            component.ngOnDestroy();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('initPlayerName', () => {
        it('should not open the NameInputDialog if socket not alive', () => {
            const spy = spyOn<any>(component['dialog'], 'open');
            initPlayerNameSpy.and.callThrough();

            component['initPlayerName']();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should open the NameInputDialog', () => {
            socketAliveSpy.and.returnValue(true);
            const spy = spyOn<any>(gameRunnerService, 'validateNameInput');
            initPlayerNameSpy.and.callThrough();
            spyOn(MatDialog.prototype, 'open').and.returnValue({
                beforeClosed: () => of({}),
            } as MatDialogRef<NameInputDialogComponent>);

            component['initPlayerName']();
            expect(spy).toHaveBeenCalled();
        });
    });

    afterEach(() => {
        fixture.destroy();
    });
});
