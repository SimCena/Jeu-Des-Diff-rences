import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ClockService } from '@app/services/clock.service';
import { GameRequestsService } from '@app/services/game-requests.service';
import { SocketService } from '@app/services/socket.service';
import { GameClient } from '@common/games';
import { RoomId } from '@common/room-id';
import { environment } from 'src/environments/environment';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { ActionType } from '@app/models/action-type';

@Component({
    selector: 'app-game-cards',
    templateUrl: './game-cards.component.html',
    styleUrls: ['./game-cards.component.scss'],
})
export class GameCardsComponent implements OnInit {
    @Input() game: GameClient;

    protected href: string;
    protected isGamePending: boolean;
    protected imageUrl: string;

    private pendingRoomName: string;

    // eslint-disable-next-line max-params
    constructor(
        protected gameService: GameRequestsService,
        protected socketService: SocketService,
        private clockService: ClockService,
        private router: Router,
        private dialog: MatDialog,
    ) {
        this.href = this.router.url;
        this.isGamePending = false;
        this.pendingRoomName = '';
    }

    ngOnInit(): void {
        if (this.socketService.isSocketAlive()) {
            this.isGamePending = this.verifyPendingRooms();
            this.subscribeToRoomUpdates();
            this.imageUrl = this.getGameUrl();
        }
    }

    protected launchGame(): void {
        this.socketService.createSoloGame(this.game.id);
        this.gameService.launchGame(this.game.id);
    }

    protected createMultiplayerGame(): void {
        this.gameService.isHost = true;
        this.socketService.createRoom(this.game.id);
        this.gameService.launchMultiplayerWaitingRoom(this.game.id);
    }

    protected joinMultiplayerGame(): void {
        this.gameService.isHost = false;
        this.socketService.joinRoom(this.pendingRoomName);
        this.gameService.launchMultiplayerWaitingRoom(this.game.id);
        this.isGamePending = false;
    }

    protected getGameUrl(): string {
        return environment.serverUrl.replace('/api', '/') + 'bmp_images/' + this.gameService.getGameUrl(this.game.id) + '?' + Date.now();
    }

    protected getRankingTime(time: number): string {
        return this.clockService.formatTime(time);
    }

    protected deleteGame(): void {
        this.dialog
            .open(ConfirmationDialogComponent, { data: ActionType.DeleteOne, width: '350px' })
            .afterClosed()
            .subscribe((confirmedDelete: boolean) => {
                if (confirmedDelete) this.socketService.deleteGame(this.game.id);
            });
    }

    protected resetGame(): void {
        this.dialog
            .open(ConfirmationDialogComponent, { data: ActionType.ResetOne, width: '350px' })
            .afterClosed()
            .subscribe((confirmedReset: boolean) => {
                if (confirmedReset) this.socketService.resetGame(this.game.id);
            });
    }

    private verifyRoomCreated(room: RoomId): void {
        if (room.gameId === this.game.id) {
            this.isGamePending = true;
            if (!this.verifyPendingRooms()) {
                this.socketService.pendingRooms.push(room);
                this.pendingRoomName = room.stringFormat;
            }
        }
    }

    private verifyRoomClosed(roomName: string): void {
        const filledRoomGameId = parseInt(roomName.split(' ')[0], 10);
        if (filledRoomGameId === this.game.id) {
            this.isGamePending = false;
            this.socketService.pendingRooms.splice(
                this.socketService.pendingRooms.findIndex((pendingRoom) => filledRoomGameId === pendingRoom.gameId),
                1,
            );
        }
    }

    private verifyPendingRooms(): boolean {
        let roomFound = false;
        this.socketService.pendingRooms.forEach((pendingGame: RoomId) => {
            if (pendingGame.gameId === this.game.id) {
                roomFound = true;
                this.pendingRoomName = pendingGame.stringFormat;
            }
        });
        return roomFound;
    }

    private subscribeToRoomUpdates(): void {
        this.socketService.subscribeRoomCreated((room: RoomId) => {
            this.verifyRoomCreated(room);
        });
        this.socketService.subscribeRoomClosed((roomName: string) => {
            this.verifyRoomClosed(roomName);
        });
    }
}
