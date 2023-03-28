/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line max-classes-per-file
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChildrenOutletContexts, Router, UrlSerializer } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { KickedDialogComponent } from '@app/components/kicked-dialog/kicked-dialog.component';
import { NameInputDialogComponent } from '@app/components/name-input-dialog/name-input-dialog.component';
import { KickedMessageType } from '@app/models/kicked-message-type';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameHandlerService } from '@app/services/game-handler.service';
import { GameRequestsService } from '@app/services/game-requests.service';
import { SocketService } from '@app/services/socket.service';
import { of, Subscription } from 'rxjs';

import { LimitedWaitingRoomPageComponent } from './limited-waiting-room-page.component';

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
    isSocketAlive(): boolean {
        return true;
    }
    subscribeDeletedGame(): void {
        return;
    }
    unsubscribeLimitedWaitingRoomEvents(): void {
        return;
    }
    unsubscribeLimitedGameEvents(): void {
        return;
    }
    limitedSearchCancelled(): void {
        return;
    }
}

@Injectable({
    providedIn: 'root',
})
class MockGameRequestsService extends GameRequestsService {
    returnToSelect(): void {
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

describe('LimitedWaitingRoomPageComponent', () => {
    let component: LimitedWaitingRoomPageComponent;
    let fixture: ComponentFixture<LimitedWaitingRoomPageComponent>;
    let gameService: GameRequestsService;
    let socketService: SocketService;
    let socketAliveSpy: jasmine.Spy;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LimitedWaitingRoomPageComponent, NameInputDialogComponent],
            imports: [
                HttpClientTestingModule,
                AppMaterialModule,
                CommonModule,
                BrowserAnimationsModule,
                RouterTestingModule,
                FormsModule,
                ReactiveFormsModule,
            ],
            providers: [
                { provide: SocketService, useClass: MockSocketService },
                {
                    provide: GameRequestsService,
                    useClass: MockGameRequestsService,
                    import: CommonModule,
                },
                {
                    provide: GameHandlerService,
                    useClass: MockGameHandlerService,
                    import: CommonModule,
                },
                {
                    provide: GameRequestsService,
                    useClass: MockGameRequestsService,
                },
                UrlSerializer,
                ChildrenOutletContexts,
            ],
        }).compileComponents();

        gameService = TestBed.inject(GameRequestsService);
        socketService = TestBed.inject(SocketService);
        fixture = TestBed.createComponent(LimitedWaitingRoomPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        socketAliveSpy = spyOn(socketService, 'isSocketAlive').and.returnValue(false);
    });

    it('should create', () => {
        socketAliveSpy.and.returnValue(true);
        expect(component).toBeTruthy();
        socketAliveSpy.and.returnValue(false);
    });

    afterEach(() => {
        fixture.destroy();
    });

    describe('constructor', () => {
        it('should initialize the waitingList', () => {
            expect(component['waitingList']).toEqual([]);
        });
    });

    describe('ngOnInit', () => {
        it('should not do anything if socket alive', () => {
            socketAliveSpy.and.returnValue(true);
            const spy = spyOn(Router.prototype, 'navigate');

            component.ngOnInit();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should call returnToSelect on GameRequestService if socket not alive', () => {
            const spy = spyOn(Router.prototype, 'navigate');

            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy', () => {
        it('should not do anything if socket not alive', () => {
            const spy = spyOn(socketService, 'unsubscribeLimitedWaitingRoomEvents');

            component.ngOnDestroy();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should call unsubscribeLimitedWaitingRoomEvents if socket is alive', () => {
            socketAliveSpy.and.returnValue(true);
            const spy = spyOn(socketService, 'unsubscribeLimitedWaitingRoomEvents');

            component.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
        it('should call unsubscribeLimitedGameEvents if socket is alive', () => {
            socketAliveSpy.and.returnValue(true);
            const spy = spyOn(socketService, 'unsubscribeLimitedGameEvents');

            component.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
        it('should unsubscribe roomKickSubscribtion if the subscription has been made', () => {
            socketAliveSpy.and.returnValue(true);
            component['roomKickSubscription'] = new Subscription();
            const spy = spyOn(component['roomKickSubscription'], 'unsubscribe');

            component.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('returnToHome', () => {
        it('should call limitedSearchCancelled on socketService', () => {
            const spy = spyOn(socketService, 'limitedSearchCancelled');

            component['returnToHome']();
            expect(spy).toHaveBeenCalled();
        });
        it('should navigate back to home', () => {
            const spy = spyOn(component['router'], 'navigate');

            component['returnToHome']();
            expect(spy).toHaveBeenCalledWith(['home']);
        });
    });

    describe('subscribeDeletedGame', () => {
        it('should call subscribeDeletedGame on the socket service', () => {
            const spy = spyOn(socketService, 'subscribeDeletedGame');

            component['subscribeDeletedGame']();
            expect(spy).toHaveBeenCalled();
        });
        it('should attach the gameSubject to the roomKickSubscription', () => {
            spyOn(socketService, 'subscribeDeletedGame').and.callFake((callback) => {
                return callback(0);
            });

            component['subscribeDeletedGame']();
            expect(component['roomKickSubscription']).toBeTruthy();
        });
        it('should call kickPlayer if gameRemaining is false', () => {
            spyOn(socketService, 'subscribeDeletedGame').and.callFake((callback) => {
                return callback(0);
            });
            const spy = spyOn<any>(component, 'kickPlayer');

            component['subscribeDeletedGame']();
            gameService.gameSubject.next(false);
            expect(spy).toHaveBeenCalledWith(KickedMessageType.NoMoreGames);
        });
        it('should not call kickPlayer if gameRemaining is true', () => {
            spyOn(socketService, 'subscribeDeletedGame').and.callFake((callback) => {
                return callback(0);
            });
            const spy = spyOn<any>(component, 'kickPlayer');

            component['subscribeDeletedGame']();
            gameService.gameSubject.next(true);
            expect(spy).not.toHaveBeenCalledWith(KickedMessageType.NoMoreGames);
        });
    });

    describe('kickPlayer', () => {
        it('should kick the player from the waiting', () => {
            const leaveSpy = spyOn<any>(component, 'returnToHome');
            const closeAllSpy = spyOn(component['dialog'], 'closeAll');
            spyOn(component['dialog'], 'open').and.returnValue({
                afterClosed: () => of({}),
            } as MatDialogRef<KickedDialogComponent>);
            component['kickPlayer'](KickedMessageType.NoMoreGames);
            expect(leaveSpy).toHaveBeenCalled();
            expect(closeAllSpy).toHaveBeenCalled();
        });
    });

    afterEach(() => {
        fixture.destroy();
    });
});
