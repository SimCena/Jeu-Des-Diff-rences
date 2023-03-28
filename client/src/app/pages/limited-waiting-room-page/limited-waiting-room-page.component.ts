import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DarkModeService } from '@app/services/dark-mode.service';
import { SocketService } from '@app/services/socket.service';
import { PlayerInfo } from '@common/player-info';
import { GameRequestsService } from '@app/services/game-requests.service';
import { KickedMessageType } from '@app/models/kicked-message-type';
import { KickedDialogComponent } from '@app/components/kicked-dialog/kicked-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-limited-waiting-room-page',
    templateUrl: './limited-waiting-room-page.component.html',
    styleUrls: ['./limited-waiting-room-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class LimitedWaitingRoomPageComponent implements OnInit, OnDestroy {
    protected waitingList: PlayerInfo[];

    private roomKickSubscription: Subscription;

    // eslint-disable-next-line max-params
    constructor(
        public darkModeService: DarkModeService,
        private gameService: GameRequestsService,
        private socketService: SocketService,
        private router: Router,
        private dialog: MatDialog,
    ) {
        this.waitingList = [];
    }

    ngOnInit(): void {
        if (!this.socketService.isSocketAlive()) {
            this.router.navigate(['home']);
            return;
        }
        this.subscribeDeletedGame();
    }

    ngOnDestroy(): void {
        if (!this.socketService.isSocketAlive()) {
            return;
        }
        this.socketService.unsubscribeLimitedWaitingRoomEvents();
        this.socketService.unsubscribeLimitedGameEvents();
        if (this.roomKickSubscription) this.roomKickSubscription.unsubscribe();
    }

    protected returnToHome(): void {
        this.socketService.limitedSearchCancelled();
        this.router.navigate(['home']);
    }

    private subscribeDeletedGame() {
        this.socketService.subscribeDeletedGame(() => {
            this.roomKickSubscription = this.gameService.gameSubject.subscribe((gamesRemaining: boolean) => {
                if (!gamesRemaining) {
                    this.kickPlayer(KickedMessageType.NoMoreGames);
                }
            });
        });
    }

    private kickPlayer(messageType: KickedMessageType): void {
        this.dialog
            .open(KickedDialogComponent, {
                data: messageType,
            })
            .afterClosed()
            .subscribe(() => {
                this.dialog.closeAll();
                this.returnToHome();
            });
    }
}
