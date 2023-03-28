import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { GameConstantsDialogComponent } from '@app/components/game-constants-dialog/game-constants-dialog.component';
import { ActionType } from '@app/models/action-type';
import { CommunicationService } from '@app/services/communication.service';
import { SocketService } from '@app/services/socket.service';
import { GameConstantsInput } from '@common/game-constants-input';

@Component({
    selector: 'app-administration-page',
    templateUrl: './administration-page.component.html',
    styleUrls: ['./administration-page.component.scss'],
})
export class AdministrationPageComponent implements OnInit, OnDestroy {
    // eslint-disable-next-line max-params
    constructor(
        protected communicationService: CommunicationService,
        private socketService: SocketService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
    ) {}

    ngOnInit(): void {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }
        this.configureSubscriptions();
        this.socketService.roomsReceived = true;
    }

    ngOnDestroy(): void {
        if (this.socketService.isSocketAlive()) {
            this.socketService.unsubscribeAdministration();
        }
    }

    protected modifyGameConstants(): void {
        this.dialog
            .open(GameConstantsDialogComponent, {})
            .afterClosed()
            .subscribe((newConstants?: GameConstantsInput) => {
                if (newConstants) this.communicationService.putGameConstants(newConstants).subscribe();
            });
    }

    protected confirmReset(): void {
        this.dialog
            .open(ConfirmationDialogComponent, { data: ActionType.ResetAll, width: '350px' })
            .afterClosed()
            .subscribe((confirmedReset: boolean) => {
                if (confirmedReset) this.socketService.resetGames();
            });
    }

    protected confirmDelete(): void {
        this.dialog
            .open(ConfirmationDialogComponent, { data: ActionType.DeleteAll, width: '350px' })
            .afterClosed()
            .subscribe((confirmedReset: boolean) => {
                if (confirmedReset) this.socketService.deleteGames();
            });
    }

    private configureSubscriptions(): void {
        this.socketService.subscribeFailedDelete(() => {
            this.snackBar.open('Erreur 503 - Le jeu ne peut pas être supprimé présentement', undefined, { duration: 3500 });
        });
        this.socketService.subscribeFailedReset(() => {
            this.snackBar.open('Erreur 503 - Le jeu ne peut pas être réinitialisé présentement', undefined, { duration: 3500 });
        });
        this.socketService.subscribeFailedDeleteAll(() => {
            this.snackBar.open('Erreur 503 - Les jeux ne peuvent pas être supprimés présentement', undefined, { duration: 3500 });
        });
        this.socketService.subscribeFailedResetAll(() => {
            this.snackBar.open('Erreur 503 - Les jeux ne peuvent pas être réinitialisés présentement', undefined, { duration: 3500 });
        });
    }
}
