/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
// eslint-disable-next-line max-classes-per-file
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameRequestsService } from '@app/services/game-requests.service';
import { SocketService } from '@app/services/socket.service';
import { GameClient } from '@common/games';
import { RoomId } from '@common/room-id';
import { of } from 'rxjs';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { GameCardsComponent } from './game-cards.component';

export const mockGame: GameClient = {
    id: 0,
    name: '',
    url: 'http://localhost:3000/bmp_images/0',
    solo: [],
    multiplayer: [],
    differenceCount: 3,
};

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
    unsubscribeRoomUpdates(): void {
        return;
    }

    unsubscribeFailedDelete(): void {
        return;
    }

    unsubscribeFailedReset(): void {
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
        return mockGame;
    }
    abandonGame(): void {
        return;
    }
    getGameUrl(id: number): string {
        return id.toString();
    }
}

describe('GameCardsComponent', () => {
    let component: GameCardsComponent;
    let fixture: ComponentFixture<GameCardsComponent>;
    let mockGameService: GameRequestsService;
    let mockSocketService: SocketService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientTestingModule, AppMaterialModule],
            declarations: [GameCardsComponent],
            providers: [
                { provide: SocketService, useClass: MockSocketService },
                {
                    provide: GameRequestsService,
                    useClass: MockGameService,
                    import: CommonModule,
                },
            ],
        }).compileComponents();

        mockSocketService = TestBed.inject(SocketService);
        GameCardsComponent.prototype.game = mockGame;
        fixture = TestBed.createComponent(GameCardsComponent);
        component = fixture.componentInstance;
        fixture.componentInstance.ngOnInit();
        mockGameService = TestBed.inject(GameRequestsService);
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should call subscribeRoomCreated if socket is alive', () => {
            spyOn(mockSocketService, 'isSocketAlive').and.returnValue(true);
            const spy = spyOn(mockSocketService, 'subscribeRoomCreated');
            spyOn(mockSocketService, 'subscribeRoomClosed');
            spyOn<any>(component, 'verifyPendingRooms');
            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });

        it('should call subscribeRoomClosed if socket is alive', () => {
            spyOn(mockSocketService, 'isSocketAlive').and.returnValue(true);
            const spy = spyOn(mockSocketService, 'subscribeRoomClosed');
            spyOn<any>(component, 'verifyPendingRooms');
            spyOn(mockSocketService, 'subscribeRoomCreated');
            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
        it('should call verifyPendingRooms if socket is alive', () => {
            spyOn(mockSocketService, 'isSocketAlive').and.returnValue(true);
            const spy = spyOn<any>(component, 'verifyPendingRooms');
            spyOn<any>(component, 'subscribeToRoomUpdates');
            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('verifyPendingRooms', () => {
        it('isGamePending should be false if game is not in pending game list', () => {
            spyOn(mockSocketService, 'isSocketAlive').and.returnValue(true);
            mockSocketService.pendingRooms = [];
            component.ngOnInit();
            expect(component['isGamePending']).toBeFalse();
        });
        it('isGamePending should be true if game is not in pending game list', () => {
            spyOn(mockSocketService, 'isSocketAlive').and.returnValue(true);
            mockSocketService.pendingRooms = [
                {
                    gameId: mockGame.id,
                    roomNumber: 0,
                    hostId: 'abcde',
                    stringFormat: 'abcde',
                },
            ];
            component.ngOnInit();
            expect(component['isGamePending']).toBeTrue();
        });
    });

    describe('verifyRoomCreated', () => {
        it("should add to socketService.pendingRooms if room isn't already pending", () => {
            mockSocketService.pendingRooms = [];
            spyOn<any>(component, 'verifyPendingRooms').and.returnValue(false);
            const room: RoomId = {
                gameId: 0,
                roomNumber: 0,
                stringFormat: '1 0',
                hostId: 'simon',
            };
            const expectedArray: RoomId[] = [room];
            spyOn(mockSocketService, 'subscribeRoomCreated').and.callFake((callback) => {
                return callback(room);
            });
            spyOn(mockSocketService, 'subscribeRoomClosed');
            component['subscribeToRoomUpdates']();
            expect(mockSocketService.pendingRooms).toEqual(expectedArray);
        });
        it('should not add to socketService.pendingRooms if room is already pending', () => {
            spyOn<any>(component, 'verifyPendingRooms').and.returnValue(true);
            const room: RoomId = {
                gameId: 0,
                roomNumber: 0,
                stringFormat: '1 0',
                hostId: 'simon',
            };
            mockSocketService.pendingRooms = [];
            const expectedArray: RoomId[] = [room];
            spyOn(mockSocketService, 'subscribeRoomCreated').and.callFake((callback) => {
                return callback(room);
            });
            spyOn(mockSocketService, 'subscribeRoomClosed');
            component['subscribeToRoomUpdates']();
            expect(mockSocketService.pendingRooms).not.toEqual(expectedArray);
        });
    });

    describe('verifyRoomClosed', () => {
        it('should remove room from socketService.pendingRooms if room is pending', () => {
            const room: RoomId = {
                gameId: 0,
                roomNumber: 0,
                stringFormat: '0 0',
                hostId: 'simon',
            };
            mockSocketService.pendingRooms = [room];
            const expectedArray: RoomId[] = [];
            spyOn(mockSocketService, 'subscribeRoomCreated');
            spyOn(mockSocketService, 'subscribeRoomClosed').and.callFake((callback) => {
                return callback(room.stringFormat);
            });
            component['subscribeToRoomUpdates']();
            expect(mockSocketService.pendingRooms).toEqual(expectedArray);
        });
        it('should not remove from socketService.pendingRooms if room is not pending', () => {
            const room: RoomId = {
                gameId: 1,
                roomNumber: 0,
                stringFormat: '1 0',
                hostId: 'simon',
            };
            mockSocketService.pendingRooms = [room];
            const expectedArray = [room];
            spyOn(mockSocketService, 'subscribeRoomCreated').and.callFake((callback) => {
                return callback(room);
            });
            spyOn(mockSocketService, 'subscribeRoomClosed');
            component['subscribeToRoomUpdates']();
            expect(mockSocketService.pendingRooms).toEqual(expectedArray);
        });
    });

    describe('launchGame', () => {
        it('should call launchGame from GameService', () => {
            const spy = spyOn(mockGameService, 'launchGame');
            component['launchGame']();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('createMultiplayerGame', () => {
        it('should call createRoom from socketService', () => {
            const spy = spyOn(mockSocketService, 'createRoom');
            spyOn(mockGameService, 'launchMultiplayerWaitingRoom');
            component['createMultiplayerGame']();
            expect(spy).toHaveBeenCalled();
        });
        it('should call launchMultiplayerWaitingRoom from GameService', () => {
            spyOn(mockSocketService, 'createRoom');
            const spy = spyOn(mockGameService, 'launchMultiplayerWaitingRoom');
            component['createMultiplayerGame']();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('joinMultiplayerGame', () => {
        it('should call joinRoom from socketService', () => {
            const spy = spyOn(mockSocketService, 'joinRoom');
            spyOn(mockGameService, 'launchMultiplayerWaitingRoom');
            component['joinMultiplayerGame']();
            expect(spy).toHaveBeenCalled();
        });
        it('should call launchMultiplayerWaitingRoom from GameService', () => {
            spyOn(mockSocketService, 'joinRoom');
            const spy = spyOn(mockGameService, 'launchMultiplayerWaitingRoom');
            component['joinMultiplayerGame']();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('getGameUrl', () => {
        it('should return game url', () => {
            expect(component['getGameUrl']().includes(mockGame.url)).toBeTrue();
        });
    });

    describe('getRankingTime', () => {
        it('should call formatTime from ClockComponent', () => {
            const spy = spyOn(component['clockService'], 'formatTime');
            component['getRankingTime'](65);
            expect(spy).toHaveBeenCalledWith(65);
        });
    });

    describe('deleteGame', () => {
        it('should call the appropriate communication service method if the confirmation button was pressed', () => {
            const spy = spyOn(component['socketService'], 'deleteGame');
            spyOn(component['dialog'], 'open').and.returnValue({
                afterClosed: () => of(true),
            } as MatDialogRef<ConfirmationDialogComponent>);
            component['deleteGame']();
            expect(spy).toHaveBeenCalledWith(0);
        });
    });

    describe('resetGame', () => {
        it('should call the appropriate communication service method if the confirmation button was pressed', () => {
            const spy = spyOn(component['socketService'], 'resetGame');
            spyOn(component['dialog'], 'open').and.returnValue({
                afterClosed: () => of(true),
            } as MatDialogRef<ConfirmationDialogComponent>);
            component['resetGame']();
            expect(spy).toHaveBeenCalledWith(0);
        });
    });

    afterEach(() => {
        fixture.destroy();
    });
});
