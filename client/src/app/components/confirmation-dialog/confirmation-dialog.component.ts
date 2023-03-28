import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActionType } from '@app/models/action-type';

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent {
    protected readonly longActionMap: Map<ActionType, string>;
    protected readonly shortActionMap: Map<ActionType, string>;

    constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>, @Inject(MAT_DIALOG_DATA) public actionType: ActionType) {
        this.longActionMap = new Map<ActionType, string>([
            [ActionType.DeleteAll, 'supprimer tous les jeux'],
            [ActionType.DeleteOne, 'supprimer ce jeu'],
            [ActionType.ResetAll, 'réinitialiser tous les meilleurs temps'],
            [ActionType.ResetOne, 'réinitialiser les meilleurs temps de ce jeu'],
            [ActionType.Abandon, 'quitter la partie'],
        ]);
        this.shortActionMap = new Map<ActionType, string>([
            [ActionType.DeleteAll, 'Supprimer'],
            [ActionType.DeleteOne, 'Supprimer'],
            [ActionType.ResetAll, 'Réinitialiser'],
            [ActionType.ResetOne, 'Réinitialiser'],
            [ActionType.Abandon, 'Quitter'],
        ]);
    }
}
