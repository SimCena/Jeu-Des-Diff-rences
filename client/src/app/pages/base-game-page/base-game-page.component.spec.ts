/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line max-classes-per-file
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/modules/material.module';
import { SocketService } from '@app/services/socket.service';
import { CongratulationsDialogComponent } from '@app/components/congratulations-dialog/congratulations-dialog.component';
import { BackgroundCanvasComponent } from '@app/components/background-canvas/background-canvas.component';
import { BaseGamePageComponent } from './base-game-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UrlSerializer } from '@angular/router';
import { GameRequestsService } from '@app/services/game-requests.service';
import { CanvasId } from '@app/models/canvas-id';
import { BackgroundComponent } from '@app/components/background/background.component';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import { MouseHandlerService } from '@app/services/mouse-handler.service';
import { GameHandlerService } from '@app/services/game-handler.service';
import { CheatingCanvasesComponent } from '@app/components/cheating-canvases/cheating-canvases.component';

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
    off(): void {
        return;
    }

    unsubscribeBaseSocketFeatures(): void {
        return;
    }
    unsubscribeGameSocketFeatures(): void {
        return;
    }
    unsubscribeTimer(): void {
        return;
    }
    isSocketAlive(): boolean {
        return true;
    }
}

@Injectable({
    providedIn: 'root',
})
class MockGameRequests extends GameRequestsService {
    abandonGame(): void {
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
class MockMouseHandlerService extends MouseHandlerService {}

describe('BaseGamePageComponent', () => {
    let component: BaseGamePageComponent;
    let fixture: ComponentFixture<BaseGamePageComponent>;
    let socketService: SocketService;
    let gameRequestsService: GameRequestsService;
    let gameHandlerService: GameHandlerService;
    let mouseHandlerService: MouseHandlerService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                BackgroundComponent,
                BaseGamePageComponent,
                CongratulationsDialogComponent,
                BackgroundCanvasComponent,
                CheatingCanvasesComponent,
            ],
            imports: [
                AppMaterialModule,
                HttpClientTestingModule,
                BrowserTestingModule,
                RouterTestingModule,
                BrowserAnimationsModule,
                FormsModule,
                ReactiveFormsModule,
            ],
            providers: [
                UrlSerializer,
                { provide: SocketService, useClass: MockSocketService },
                { provide: GameRequestsService, useClass: MockGameRequests, import: CommonModule },
                { provide: GameHandlerService, useClass: MockGameHandlerService },
                { provide: MouseHandlerService, useClass: MockMouseHandlerService },
            ],
        }).compileComponents();

        mouseHandlerService = TestBed.inject(MouseHandlerService);
        gameHandlerService = TestBed.inject(GameHandlerService);
        gameRequestsService = TestBed.inject(GameRequestsService);
        socketService = TestBed.inject(SocketService);
        fixture = TestBed.createComponent(BaseGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('constructor', () => {
        it('should call initBooleans on game handler service', () => {
            const spy = spyOn(gameHandlerService, 'initBooleans');

            TestBed.createComponent(BaseGamePageComponent);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('ngOnInit', () => {
        it('should call abandonGame if not already connected', () => {
            spyOn(socketService, 'isSocketAlive').and.callFake(() => {
                return false;
            });
            const spy = spyOn(gameRequestsService, 'abandonGame');

            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
        it('should call configureGame on game handler if already connected', () => {
            spyOn(socketService, 'isSocketAlive').and.callFake(() => {
                return true;
            });
            const spy = spyOn(gameHandlerService, 'configureGame');

            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
        it('should not call configureGame on game handler if not already connected', () => {
            spyOn(socketService, 'isSocketAlive').and.callFake(() => {
                return false;
            });
            const spy = spyOn(gameHandlerService, 'configureGame');

            component.ngOnInit();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy', () => {
        it('should call unsubscribeBaseSocketFeatures if socket alice', () => {
            const unsubscribeBaseSocketFeaturesSpy = spyOn(socketService, 'unsubscribeBaseSocketFeatures');

            component.ngOnDestroy();
            expect(unsubscribeBaseSocketFeaturesSpy).toHaveBeenCalled();
        });
        it('should call not unsubscribeBaseSocketFeatures if socket not alice', () => {
            spyOn(socketService, 'isSocketAlive').and.callFake(() => {
                return false;
            });
            const unsubscribeBaseSocketFeaturesSpy = spyOn(socketService, 'unsubscribeBaseSocketFeatures');

            component.ngOnDestroy();
            expect(unsubscribeBaseSocketFeaturesSpy).not.toHaveBeenCalled();
        });
    });

    describe('getCanvasId', () => {
        it('should return CanvasId enum', () => {
            component['getCanvasId']();
            expect(component['getCanvasId']()).toBe(CanvasId);
        });
    });

    describe('getErrorMessagePosition', () => {
        it('should call getPositionAsCss on mouseHandler', () => {
            const spy = spyOn(mouseHandlerService, 'getPositionAsCSS');

            component['getErrorMessagePosition']();
            expect(spy).toHaveBeenCalledWith(true);
        });
    });

    afterEach(() => {
        fixture.destroy();
    });
});
