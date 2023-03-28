/* eslint-disable @typescript-eslint/no-empty-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import { NameInputValue } from '@app/interfaces/name-input-value';
import { AppMaterialModule } from '@app/modules/material.module';
import { NameInputDialogComponent } from './name-input-dialog.component';

describe('NameInputDialogComponent', () => {
    let component: NameInputDialogComponent;
    let fixture: ComponentFixture<NameInputDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NameInputDialogComponent],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {
                        close: (nameInputValue: NameInputValue) => {
                            return nameInputValue;
                        },
                    },
                },
            ],
            imports: [AppMaterialModule, BrowserTestingModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(NameInputDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('input validators', () => {
        it('should return false if name is too short', () => {
            component['name'].setValue('');
            expect(component['name'].invalid).toBeTrue();
        });
        it('should return false if name is too long', () => {
            component['name'].setValue('thisNameExceedsTheMaximumAmountOfCharacters');
            expect(component['name'].invalid).toBeTrue();
        });
    });

    describe('getErrorMessage', () => {
        it('should return the right error message for an empty name', () => {
            component['name'].setValue('');
            fixture.detectChanges();
            expect(component['getErrorMessage']()).toEqual('Nom de joueur obligatoire');
        });
        it('should return the right error message for a too long name', () => {
            component['name'].setValue('abcdefghijklmnopqrstuvwxyz');
            fixture.detectChanges();
            expect(component['getErrorMessage']()).toEqual('Trop long (plus de 15 caractères)');
        });
        it('should return the right error message for a name with spaces', () => {
            component['name'].setValue(' ');
            fixture.detectChanges();
            expect(component['getErrorMessage']()).toEqual("Pas d'espaces dans le nom de joueur");
            component['name'].setValue('  ');
            fixture.detectChanges();
            expect(component['getErrorMessage']()).toEqual("Pas d'espaces dans le nom de joueur");
            component['name'].setValue(' a ');
            fixture.detectChanges();
            expect(component['getErrorMessage']()).toEqual("Pas d'espaces dans le nom de joueur");
            component['name'].setValue(' a');
            fixture.detectChanges();
            expect(component['getErrorMessage']()).toEqual("Pas d'espaces dans le nom de joueur");
            component['name'].setValue('a ');
            fixture.detectChanges();
            expect(component['getErrorMessage']()).toEqual("Pas d'espaces dans le nom de joueur");
        });
    });

    describe('validateName', () => {
        it('should mark the name input as touched and update the name value and validity', () => {
            const markAsTouchedSpy = spyOn(component['name'], 'markAsTouched');
            const updateValueAndValiditySpy = spyOn(component['name'], 'updateValueAndValidity');
            component['validateName']();
            expect(markAsTouchedSpy).toHaveBeenCalled();
            expect(updateValueAndValiditySpy).toHaveBeenCalled();
        });
    });

    describe('closeValid', () => {
        it('should close the dialog with the right result if name is valid', () => {
            component['name'].setValue('Jean');
            const closeSpy = spyOn(component.dialogRef, 'close');
            component['closeWithValidation']();
            expect(closeSpy).toHaveBeenCalledWith({ name: 'Jean', confirmed: true });
        });
        it('should call closeWithoutValidation if name value is invalid', () => {
            component['name'].setValue('');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const invalidSpy = spyOn<any>(component, 'closeWithoutValidation');
            component['closeWithValidation']();
            expect(invalidSpy).toHaveBeenCalled();
        });
    });

    describe('closeInvalid', () => {
        it('should close the dialog with the right result if name is invalid', () => {
            component['name'].setValue('Jean');
            const closeSpy = spyOn(component.dialogRef, 'close');
            component['closeWithoutValidation']();
            expect(closeSpy).toHaveBeenCalledWith({ name: '', confirmed: false });
        });
    });
});
