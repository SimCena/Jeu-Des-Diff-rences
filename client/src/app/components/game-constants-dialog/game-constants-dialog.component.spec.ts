/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BAD_GUESS_CONSTANTS, DEFAULT_GAME_CONSTANTS, GOOD_GUESS_CONSTANTS, INITIAL_TIME_CONSTANTS } from '@app/constants/game';
import { GameConstantsGroup } from '@app/interfaces/game-constants-group';
import { FormType } from '@app/models/form-type';
import { CommunicationService } from '@app/services/communication.service';
import { GameConstantsInput } from '@common/game-constants-input';
import { of } from 'rxjs';

import { GameConstantsDialogComponent } from './game-constants-dialog.component';

const DEFAULT_CONSTANTS: GameConstantsGroup = {
    default: 30,
    min: 0,
    max: 60,
};

const GAME_CONSTANTS: GameConstantsInput = {
    initialTime: 30,
    goodGuessTime: 5,
    hintUsedTime: 5,
};

describe('GameConstantsDialogComponent', () => {
    let component: GameConstantsDialogComponent;
    let fixture: ComponentFixture<GameConstantsDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameConstantsDialogComponent],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {
                        close: (gameConstantsInput: GameConstantsInput) => {
                            return gameConstantsInput;
                        },
                    },
                },
            ],
            imports: [
                HttpClientTestingModule,
                ReactiveFormsModule,
                FormsModule,
                MatFormFieldModule,
                MatIconModule,
                MatInputModule,
                BrowserAnimationsModule,
            ],
        }).compileComponents();

        spyOn(CommunicationService.prototype, 'getGameConstants').and.returnValue(of(GAME_CONSTANTS));
        fixture = TestBed.createComponent(GameConstantsDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('initForm', () => {
        it('should get the current constants', () => {
            component['currentConstants'] = { initialTime: 42, goodGuessTime: 3, hintUsedTime: 2 };
            component['initForm']();
            expect(component['currentConstants']).toEqual(GAME_CONSTANTS);
        });
        it('should call initFormControls', () => {
            const spy = spyOn<any>(component, 'initFormControls');
            component['initForm']();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('initFormControls', () => {
        it('should initialize the initial time form control', () => {
            const spy = spyOn<any>(component, 'initFormControl');
            component['initFormControls']();
            expect(spy).toHaveBeenCalledWith(GAME_CONSTANTS.initialTime, INITIAL_TIME_CONSTANTS);
        });
        it('should initialize the good guess time form control', () => {
            const spy = spyOn<any>(component, 'initFormControl');
            component['initFormControls']();
            expect(spy).toHaveBeenCalledWith(GAME_CONSTANTS.goodGuessTime, GOOD_GUESS_CONSTANTS);
        });
        it('should initialize the bad guess time form control', () => {
            const spy = spyOn<any>(component, 'initFormControl');
            component['initFormControls']();
            expect(spy).toHaveBeenCalledWith(GAME_CONSTANTS.hintUsedTime, BAD_GUESS_CONSTANTS);
        });
    });

    describe('initFormControl', () => {
        it('should return a new form control', () => {
            expect(component['initFormControl'](5, DEFAULT_CONSTANTS)).toBeDefined();
        });
    });

    describe('closeAndSave', () => {
        it('should not call dialogRef.close if the form group is null', () => {
            const spy = spyOn(component['dialogRef'], 'close');
            component['constantsForm'] = null as unknown as FormGroup<any>;
            component['closeAndSave']();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should not call dialogRef.close if either form control is null', () => {
            const spy = spyOn(component['dialogRef'], 'close');
            spyOn(component['constantsForm'], 'get').and.returnValue(null);
            component['closeAndSave']();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should close the dialog with the right data', () => {
            component['constantsForm'].get('initialTime')!.setValue(10);
            component['constantsForm'].get('goodGuessTime')!.setValue(20);
            component['constantsForm'].get('hintUsedTime')!.setValue(30);
            const spy = spyOn(component.dialogRef, 'close');
            component['closeAndSave']();
            expect(spy).toHaveBeenCalledWith({ initialTime: 10, goodGuessTime: 20, hintUsedTime: 30 });
        });
    });

    describe('areInputsInvalid', () => {
        it('should return true if the form control is null', () => {
            component['constantsForm'] = null as unknown as FormGroup<any>;
            expect(component['areInputsInvalid']()).toBeTrue();
        });
        it('should return false if the form control is valid', () => {
            expect(component['areInputsInvalid']()).toBeFalse();
        });
        it('should return true if the form control is invalid', () => {
            component['constantsForm'].setErrors({ invalid: true });
            expect(component['areInputsInvalid']()).toBeTrue();
        });
    });

    describe('getErrorMessage', () => {
        it('should return the initial time error message when the initial time is concerned', () => {
            expect(component['getErrorMessage'](FormType.InitialTime)).toEqual(
                `Doit être comprise entre ${INITIAL_TIME_CONSTANTS.min} et ${INITIAL_TIME_CONSTANTS.max} secondes`,
            );
        });
        it('should return the good guess time error message when the good guess time is concerned', () => {
            expect(component['getErrorMessage'](FormType.GoodGuessTime)).toEqual(
                `Doit être comprise entre ${GOOD_GUESS_CONSTANTS.min} et ${GOOD_GUESS_CONSTANTS.max} secondes`,
            );
        });
        it('should return the bad guess time error message when the bad guess time is concerned', () => {
            expect(component['getErrorMessage'](FormType.HintUsedTime)).toEqual(
                `Doit être comprise entre ${BAD_GUESS_CONSTANTS.min} et ${BAD_GUESS_CONSTANTS.max} secondes`,
            );
        });
    });

    describe('setDefaultConstants', () => {
        it('should set the initial time value to the default constant if the initial time sub form is not null', () => {
            component['constantsForm'].get('initialTime')?.setValue(0);
            component['setDefaultConstants']();
            expect(component['constantsForm'].get('initialTime')!.value).toEqual(DEFAULT_GAME_CONSTANTS.initialTime);
        });
        it('should set the good time value to the default constant if the good time sub form is not null', () => {
            component['constantsForm'].get('goodGuessTime')?.setValue(0);
            component['setDefaultConstants']();
            expect(component['constantsForm'].get('goodGuessTime')!.value).toEqual(DEFAULT_GAME_CONSTANTS.goodGuessTime);
        });
        it('should set the bad time value to the default constant if the bad time sub form is not null', () => {
            component['constantsForm'].get('hintUsedTime')?.setValue(0);
            component['setDefaultConstants']();
            expect(component['constantsForm'].get('hintUsedTime')!.value).toEqual(DEFAULT_GAME_CONSTANTS.hintUsedTime);
        });
        it('should not set the initial time value to the default constant if the initial time sub form is null', () => {
            spyOn(component['constantsForm'], 'get').and.returnValue(null);
            component['setDefaultConstants']();
            expect(true).toBeTrue();
        });
    });
});
