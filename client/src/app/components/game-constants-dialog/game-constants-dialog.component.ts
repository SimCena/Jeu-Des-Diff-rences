/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BAD_GUESS_CONSTANTS, DEFAULT_GAME_CONSTANTS, GOOD_GUESS_CONSTANTS, INITIAL_TIME_CONSTANTS } from '@app/constants/game';
import { GameConstantsGroup } from '@app/interfaces/game-constants-group';
import { FormType } from '@app/models/form-type';
import { CommunicationService } from '@app/services/communication.service';
import { GameConstantsInput } from '@common/game-constants-input';

@Component({
    selector: 'app-game-constants-dialog',
    templateUrl: './game-constants-dialog.component.html',
    styleUrls: ['./game-constants-dialog.component.scss'],
})
export class GameConstantsDialogComponent {
    protected type: typeof FormType;
    protected constantsForm: FormGroup;
    private currentConstants: GameConstantsInput;

    constructor(
        public dialogRef: MatDialogRef<GameConstantsDialogComponent>,
        private communicationService: CommunicationService,
        private fb: FormBuilder,
    ) {
        this.type = FormType;
        this.initForm();
    }

    protected setDefaultConstants(): void {
        this.constantsForm.get('initialTime')?.setValue(DEFAULT_GAME_CONSTANTS.initialTime);
        this.constantsForm.get('goodGuessTime')?.setValue(DEFAULT_GAME_CONSTANTS.goodGuessTime);
        this.constantsForm.get('hintUsedTime')?.setValue(DEFAULT_GAME_CONSTANTS.hintUsedTime);
    }

    protected getErrorMessage(type: FormType): string {
        let timeConstants: GameConstantsGroup;
        switch (type) {
            case FormType.InitialTime:
                timeConstants = INITIAL_TIME_CONSTANTS;
                break;
            case FormType.GoodGuessTime:
                timeConstants = GOOD_GUESS_CONSTANTS;
                break;
            case FormType.HintUsedTime:
                timeConstants = BAD_GUESS_CONSTANTS;
                break;
        }
        return `Doit être comprise entre ${timeConstants.min} et ${timeConstants.max} secondes`;
    }

    protected areInputsInvalid(): boolean {
        return this.constantsForm ? this.constantsForm.invalid : true;
    }

    protected closeAndSave(): void {
        if (!this.constantsForm) return;
        if (!this.constantsForm.get('initialTime') || !this.constantsForm.get('goodGuessTime') || !this.constantsForm.get('hintUsedTime')) return;
        // Here, non-null assertions were used because TypeScript thinks there is a chance for one of the subform to be null, although
        // we verify on the line above that it is not the case.
        this.dialogRef.close({
            initialTime: this.constantsForm.get('initialTime')!.value,
            goodGuessTime: this.constantsForm.get('goodGuessTime')!.value,
            hintUsedTime: this.constantsForm.get('hintUsedTime')!.value,
        });
    }

    private initForm(): void {
        this.communicationService.getGameConstants().subscribe((constants) => {
            this.currentConstants = constants;
            this.initFormControls();
        });
    }

    private initFormControls(): void {
        this.constantsForm = this.fb.group({
            initialTime: this.initFormControl(this.currentConstants.initialTime, INITIAL_TIME_CONSTANTS),
            goodGuessTime: this.initFormControl(this.currentConstants.goodGuessTime, GOOD_GUESS_CONSTANTS),
            hintUsedTime: this.initFormControl(this.currentConstants.hintUsedTime, BAD_GUESS_CONSTANTS),
        });
    }

    private initFormControl(gameConstant: number, defaultValues: GameConstantsGroup): FormControl {
        return new FormControl(gameConstant, [Validators.required, Validators.min(defaultValues.min), Validators.max(defaultValues.max)]);
    }
}
