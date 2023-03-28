import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MAX_NAME_LENGTH } from '@app/constants/game';
import { noWhiteSpaceValidator } from '@app/directives/whitespace-validator.directive';
import { NameInputValue } from '@app/interfaces/name-input-value';

@Component({
    selector: 'app-name-input-dialog',
    templateUrl: './name-input-dialog.component.html',
    styleUrls: ['./name-input-dialog.component.scss'],
})
export class NameInputDialogComponent {
    protected name: FormControl;

    constructor(public dialogRef: MatDialogRef<NameInputDialogComponent>) {
        dialogRef.disableClose = true;
        this.name = new FormControl('', [Validators.required, Validators.maxLength(MAX_NAME_LENGTH), noWhiteSpaceValidator]);
    }

    protected validateName(): void {
        this.name.markAsTouched();
        this.name.updateValueAndValidity();
    }

    protected closeWithValidation(): void {
        if (this.name.invalid) {
            this.closeWithoutValidation();
        }

        const result: NameInputValue = {
            name: this.name.value,
            confirmed: true,
        };
        this.dialogRef.close(result);
    }

    protected closeWithoutValidation(): void {
        const result: NameInputValue = {
            name: '',
            confirmed: false,
        };
        this.dialogRef.close(result);
    }

    protected getErrorMessage(): string {
        if (this.name.hasError('required')) {
            return 'Nom de joueur obligatoire';
        } else if (this.name.hasError('whitespace')) {
            return "Pas d'espaces dans le nom de joueur";
        }

        return 'Trop long (plus de 15 caractères)';
    }
}
