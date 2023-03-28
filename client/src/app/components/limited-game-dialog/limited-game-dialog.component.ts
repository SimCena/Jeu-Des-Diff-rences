import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MAX_NAME_LENGTH } from '@app/constants/game';
import { noWhiteSpaceValidator } from '@app/directives/whitespace-validator.directive';
import { LimitedGameChoice } from '@app/interfaces/limited-game-value';

@Component({
    selector: 'app-limited-game-dialog',
    templateUrl: './limited-game-dialog.component.html',
    styleUrls: ['./limited-game-dialog.component.scss'],
})
export class LimitedGameDialogComponent {
    protected name: FormControl;
    protected type: typeof LimitedGameChoice;

    constructor(public dialogRef: MatDialogRef<LimitedGameDialogComponent>) {
        dialogRef.disableClose = true;
        this.type = LimitedGameChoice;
        this.name = new FormControl('', [Validators.required, Validators.maxLength(MAX_NAME_LENGTH), noWhiteSpaceValidator]);
    }

    protected validateName(): void {
        this.name.markAsTouched();
        this.name.updateValueAndValidity();
    }

    protected close(startGame: boolean, choice: LimitedGameChoice): void {
        this.dialogRef.close({ name: startGame ? this.name.value : '', choice });
    }

    protected getErrorMessage(): string {
        if (this.name.hasError('required')) return 'Nom de joueur obligatoire';
        if (this.name.hasError('whitespace')) return "Pas d'espaces dans le nom de joueur";
        return 'Trop long (plus de 15 caractères)';
    }
}
