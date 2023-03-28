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
import { ChildrenOutletContexts, UrlSerializer } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { KickedDialogComponent } from '@app/components/kicked-dialog/kicked-dialog.component';
import { NameInputDialogComponent } from '@app/components/name-input-dialog/name-input-dialog.component';
import { KickedMessageType } from '@app/models/kicked-message-type';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameHandlerService } from '@app/services/game-handler.service';
import { GameRequestsService } from '@app/services/game-requests.service';
import { SocketService } from '@app/services/socket.service';
import { PlayerInfo } from '@common/player-info';
import { of } from 'rxjs';

import { WaitingRoomPageComponent } from './waiting-room-page.component';

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
    unsubscribeHostUpdates(): void {
        return;
    }
    unsubscribeParticipantUpdates(): void {
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

describe('WaitingRoomPageComponent', () => {
    let component: WaitingRoomPageComponent;
    let fixture: ComponentFixture<WaitingRoomPageComponent>;
    let socketService: SocketService;
    let gameRequestsService: GameRequestsService;
    let gameHandlerService: GameHandlerService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [WaitingRoomPageComponent, NameInputDialogComponent],
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
                UrlSerializer,
                ChildrenOutletContexts,
            ],
        }).compileComponents();

        socketService = TestBed.inject(SocketService);
        gameRequestsService = TestBed.inject(GameRequestsService);
        gameHandlerService = TestBed.inject(GameHandlerService);
        fixture = TestBed.createComponent(WaitingRoomPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('constructor', () => {
        it('should set gameAccepted to false', () => {
            expect(component['gameAccepted']).toBeFalse();
        });
        it('should set gameDeleted to false', () => {
            expect(component['gameDeleted']).toBeFalse();
        });
    });

    describe('ngOnInit', () => {
        it('should call askPlayerName', () => {
            const spy = spyOn<any>(component, 'askPlayerName');
            spyOn(component['changeDetection'], 'detectChanges');
            spyOn<any>(component, 'subscribeHostUpdates');
            spyOn<any>(component, 'subscribeParticipantUpdates');
            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
        it('should call returnToSelect from gameService if socket is not alive', () => {
            const spy = spyOn(gameRequestsService, 'returnToSelect');
            spyOn(socketService, 'isSocketAlive').and.returnValue(false);
            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
        it('should call subscribeHostUpdates if it is the host', () => {
            gameRequestsService['isHost'] = true;
            spyOn<any>(component, 'askPlayerName');
            spyOn(component['changeDetection'], 'detectChanges');
            const spy = spyOn<any>(component, 'subscribeHostUpdates');
            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
        it('should call subscribeParticipantUpdates if it is the host', () => {
            gameRequestsService['isHost'] = false;
            spyOn<any>(component, 'askPlayerName');
            spyOn(component['changeDetection'], 'detectChanges');
            const spy = spyOn<any>(component, 'subscribeParticipantUpdates');
            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
        it('should call detectChanges', () => {
            spyOn<any>(component, 'askPlayerName');
            const spy = spyOn(component['changeDetection'], 'detectChanges');
            spyOn<any>(component, 'subscribeHostUpdates');
            spyOn<any>(component, 'subscribeParticipantUpdates');
            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('askPlayerName', () => {
        it('should open the dialog', () => {
            const spy = spyOn(component['dialog'], 'open').and.callThrough();
            component['askPlayerName']();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('validateNameInput', () => {
        it('should call returnToSelect if nameInputValue.confirmed false', () => {
            const spy = spyOn(gameRequestsService, 'returnToSelect');
            component['validateNameInput']({ name: '', confirmed: false });
            expect(spy).toHaveBeenCalled();
        });
        it('should call validateNameInput if change the playerName if nameInputValue.confirmed true', () => {
            component['validateNameInput']({ name: 'test', confirmed: true });
            expect(gameHandlerService['playerName']).toEqual('test');
        });
    });

    describe('subscribeHostUpdates', () => {
        it('subscribeAddedNameHostList callback should add player in waitingList', () => {
            const playerInfo: PlayerInfo = {
                name: 'simon',
                socketId: 'simonsocket',
            };
            component['waitingList'] = [];
            spyOn(socketService, 'subscribeAddedNameHostList').and.callFake((callback) => {
                return callback(playerInfo);
            });
            const testArray: PlayerInfo[] = [playerInfo];
            component['subscribeHostUpdates']();
            expect(component['waitingList']).toEqual(testArray);
        });
        it('subscribeParticipantLeft callback should add player in waitingList', () => {
            const playerInfo: PlayerInfo = {
                name: 'simon',
                socketId: 'simonsocket',
            };
            component['waitingList'] = [playerInfo];
            spyOn(socketService, 'subscribeParticipantLeft').and.callFake((callback) => {
                return callback(playerInfo.socketId);
            });
            const testArray: PlayerInfo[] = [];
            component['subscribeHostUpdates']();
            expect(component['waitingList']).toEqual(testArray);
        });
    });

    describe('subscribeParticipantUpdates', () => {
        it('subscribeRoomDeleted callback should kick player if the game has not been deleted', () => {
            component['gameDeleted'] = false;
            const spy = spyOn<any>(component, 'kickPlayer');
            spyOn(socketService, 'subscribeRoomDeleted').and.callFake((callback) => {
                return callback();
            });
            component['subscribeParticipantUpdates']();
            expect(spy).toHaveBeenCalledWith(KickedMessageType.HostLeft);
        });
        it('subscribePlayerDecision callback should leave room and kick player', () => {
            const playerInfo: PlayerInfo = {
                name: 'simon',
                socketId: 'simonsocket',
            };
            const kickSpy = spyOn<any>(component, 'kickPlayer');
            const leaveRoomSpy = spyOn(socketService, 'leaveRoom');
            spyOn(socketService, 'subscribePlayerDecision').and.callFake((callback) => {
                return callback(playerInfo.socketId);
            });
            spyOn(socketService, 'getSocketId').and.returnValue('wrongId');
            component['subscribeParticipantUpdates']();
            expect(leaveRoomSpy).toHaveBeenCalledWith('gameRoom');
            expect(kickSpy).toHaveBeenCalledWith(KickedMessageType.HostRefused);
        });
        it('subscribePlayerDecision callback should call launchMultiplayerGame if id received is this socket id', () => {
            const playerInfo: PlayerInfo = {
                name: 'simon',
                socketId: 'simonsocket',
            };
            const spy = spyOn(gameRequestsService, 'launchMultiplayerGame');
            spyOn(socketService, 'subscribePlayerDecision').and.callFake((callback) => {
                return callback(playerInfo.socketId);
            });
            spyOn(socketService, 'getSocketId').and.returnValue(playerInfo.socketId);
            component['subscribeParticipantUpdates']();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('subscribeBothUpdates', () => {
        it('subscribeDeletedGame should kick a player if the game has been deleted', () => {
            component['gameService']['currentGameId'] = 4;
            spyOn(socketService, 'subscribeDeletedGame').and.callFake((callback) => {
                return callback(4);
            });
            const spy = spyOn<any>(component, 'kickPlayer');
            component['subscribeBothUpdates']();
            expect(spy).toHaveBeenCalledWith(KickedMessageType.DeletedGame);
        });
    });

    describe('rejectPlayer', () => {
        it('should call rejectPlayer from socketService', () => {
            const playerInfo: PlayerInfo = {
                name: 'simon',
                socketId: 'simonsocket',
            };
            const spy = spyOn(socketService, 'rejectPlayer');
            component['rejectPlayer'](playerInfo);
            expect(spy).toHaveBeenCalledOnceWith(playerInfo.socketId);
        });
    });

    describe('acceptPlayer', () => {
        it('should call acceptPlayer from socketService', () => {
            const playerInfo: PlayerInfo = {
                name: 'simon',
                socketId: 'simonsocket',
            };
            const spy = spyOn(socketService, 'acceptPlayer');
            component['acceptPlayer'](playerInfo);
            expect(spy).toHaveBeenCalledOnceWith(playerInfo.socketId);
        });
        it('should set gameAccepted boolean to true', () => {
            const playerInfo: PlayerInfo = {
                name: 'simon',
                socketId: 'simonsocket',
            };
            component['gameAccepted'] = false;
            component['acceptPlayer'](playerInfo);
            expect(component['gameAccepted']).toBeTrue();
        });
        it('should call launchMultiplayerGame from gameService', () => {
            const playerInfo: PlayerInfo = {
                name: 'simon',
                socketId: 'simonsocket',
            };
            const spy = spyOn(gameRequestsService, 'launchMultiplayerGame');
            component['acceptPlayer'](playerInfo);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy', () => {
        it('should call deleteRoom from socketService if it is the host', () => {
            gameRequestsService['isHost'] = true;
            const spy = spyOn(socketService, 'deleteRoom');
            component.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
        it('should call unsubscribeHostUpdates from socketService if it is the host', () => {
            gameRequestsService['isHost'] = true;
            const spy = spyOn(socketService, 'unsubscribeHostUpdates');
            component.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
        it('should call leaveRoom from socketService if it is the host', () => {
            gameRequestsService['isHost'] = false;
            const spy = spyOn(socketService, 'leaveRoom');
            component.ngOnDestroy();
            expect(spy).toHaveBeenCalledOnceWith('gameRoom');
        });
        it('should call unsubscribeParticipantUpdates from socketService if it is the host', () => {
            gameRequestsService['isHost'] = false;
            const spy = spyOn(socketService, 'unsubscribeParticipantUpdates');
            component.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
        it('should not call leaveRoom from socketService if it is the host but socket is not connected', () => {
            gameRequestsService['isHost'] = false;
            spyOn(socketService, 'isSocketAlive').and.returnValue(false);
            const spy = spyOn(socketService, 'leaveRoom');
            component.ngOnDestroy();
            expect(spy).not.toHaveBeenCalledOnceWith('gameRoom');
        });
    });

    describe('kickPlayer', () => {
        it('should kick the player from their waiting room or game', () => {
            const leaveSpy = spyOn<any>(component['gameService'], 'returnToSelect');
            const closeAllSpy = spyOn(component['dialog'], 'closeAll');
            spyOn(component['dialog'], 'open').and.returnValue({
                afterClosed: () => of({}),
            } as MatDialogRef<KickedDialogComponent>);
            component['kickPlayer'](KickedMessageType.DeletedGame);
            expect(leaveSpy).toHaveBeenCalled();
            expect(closeAllSpy).toHaveBeenCalled();
        });
    });

    afterEach(() => {
        fixture.destroy();
    });
});
