import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { KickedDialogComponent } from '@app/components/kicked-dialog/kicked-dialog.component';
import { NameInputDialogComponent } from '@app/components/name-input-dialog/name-input-dialog.component';
import { NameInputValue } from '@app/interfaces/name-input-value';
import { KickedMessageType } from '@app/models/kicked-message-type';
import { DarkModeService } from '@app/services/dark-mode.service';
import { GameRequestsService } from '@app/services/game-requests.service';
import { SocketService } from '@app/services/socket.service';
import { PlayerInfo } from '@common/player-info';
import { GameHandlerService } from '@app/services/game-handler.service';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class WaitingRoomPageComponent implements OnInit, OnDestroy {
    protected waitingList: PlayerInfo[];
    private gameAccepted: boolean;
    private gameDeleted: boolean;

    // eslint-disable-next-line max-params
    constructor(
        public darkModeService: DarkModeService,
        protected gameService: GameRequestsService,
        private gameHandlerService: GameHandlerService,
        private dialog: MatDialog,
        private changeDetection: ChangeDetectorRef,
        private socketService: SocketService,
    ) {
        this.waitingList = [];
        this.gameAccepted = false;
        this.gameDeleted = false;
    }

    ngOnInit(): void {
        if (!this.socketService.isSocketAlive()) {
            this.gameService.returnToSelect();
            return;
        }
        if (this.gameService.isHost) {
            this.subscribeHostUpdates();
        } else {
            this.subscribeParticipantUpdates();
        }
        this.subscribeBothUpdates();
        this.askPlayerName();
        this.changeDetection.detectChanges();
    }

    ngOnDestroy(): void {
        if (!this.socketService.isSocketAlive()) {
            return;
        }
        if (this.gameService.isHost) {
            this.socketService.unsubscribeHostUpdates();
            if (!this.gameAccepted) this.socketService.deleteRoom();
            return;
        }
        this.socketService.unsubscribeParticipantUpdates();
        if (!this.gameAccepted) this.socketService.leaveRoom('gameRoom');
    }

    protected rejectPlayer(player: PlayerInfo): void {
        this.socketService.rejectPlayer(player.socketId);
    }

    protected acceptPlayer(player: PlayerInfo): void {
        this.gameAccepted = true;
        this.socketService.acceptPlayer(player.socketId);
        this.gameService.launchMultiplayerGame();
    }

    private askPlayerName(): void {
        this.dialog
            .open(NameInputDialogComponent)
            .beforeClosed()
            .subscribe((nameInputValue: NameInputValue) => {
                this.validateNameInput(nameInputValue);
            });
    }

    private validateNameInput(nameInputValue: NameInputValue): void {
        if (!nameInputValue || !nameInputValue.confirmed) {
            this.gameService.returnToSelect();
        } else {
            this.gameHandlerService.playerName = nameInputValue.name;
            if (!this.gameService.isHost) this.socketService.sendNameWaitingList(this.gameHandlerService.playerName);
        }
    }

    private subscribeHostUpdates(): void {
        this.socketService.subscribeAddedNameHostList((playerInfo: PlayerInfo) => {
            this.waitingList.push(playerInfo);
        });
        this.socketService.subscribeParticipantLeft((socketId: string) => {
            if (this.waitingList.find((playerInfo) => playerInfo.socketId === socketId)) {
                this.waitingList.splice(
                    this.waitingList.findIndex((playerInfo) => playerInfo.socketId === socketId),
                    1,
                );
            }
        });
    }

    private subscribeParticipantUpdates(): void {
        this.socketService.subscribeRoomDeleted(() => {
            if (!this.gameDeleted) this.kickPlayer(KickedMessageType.HostLeft);
        });
        this.socketService.subscribePlayerDecision((socketId: string) => {
            if (this.socketService.getSocketId() !== socketId) {
                this.socketService.leaveRoom('gameRoom');
                this.kickPlayer(KickedMessageType.HostRefused);
                return;
            }
            this.gameAccepted = true;
            this.gameService.launchMultiplayerGame();
        });
    }

    private subscribeBothUpdates(): void {
        this.socketService.subscribeDeletedGame((id: number) => {
            if (id === this.gameService.currentGameId) {
                this.gameDeleted = true;
                this.kickPlayer(KickedMessageType.DeletedGame);
            }
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
                this.gameService.returnToSelect();
            });
    }
}
