import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import { LimitedGameChoice } from '@app/interfaces/limited-game-value';
import { AppMaterialModule } from '@app/modules/material.module';

import { LimitedGameDialogComponent } from '@app/components/limited-game-dialog/limited-game-dialog.component';

describe('LimitedGameDialogComponent', () => {
    let component: LimitedGameDialogComponent;
    let fixture: ComponentFixture<LimitedGameDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LimitedGameDialogComponent],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {
                        close: (lmitedGameChoice: LimitedGameChoice) => {
                            return lmitedGameChoice;
                        },
                    },
                },
            ],
            imports: [AppMaterialModule, BrowserTestingModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(LimitedGameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('constructor', () => {
        it('should set disableClose to true on the dialogRef', () => {
            expect(component.dialogRef.disableClose).toBeTrue();
        });
    });

    describe('validateName', () => {
        it('should calls markAsTouched on the message FormControl', () => {
            const spy = spyOn(component['name'], 'markAsTouched');

            component['validateName']();
            expect(spy).toHaveBeenCalled();
        });
        it('should calls updateValueAndValidity on the message FormControl', () => {
            const spy = spyOn(component['name'], 'updateValueAndValidity');

            component['validateName']();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('close', () => {
        it('should call close on the dialogRef with coop', () => {
            const spy = spyOn(component.dialogRef, 'close');
            component['name'].setValue('test');

            component['close'](true, LimitedGameChoice.Coop);
            expect(spy).toHaveBeenCalledWith({ name: 'test', choice: LimitedGameChoice.Coop });
        });
        it('should call close on the dialogRef with cancel', () => {
            const spy = spyOn(component.dialogRef, 'close');
            component['name'].setValue('test');

            component['close'](false, LimitedGameChoice.Cancel);
            expect(spy).toHaveBeenCalledWith({ name: '', choice: LimitedGameChoice.Cancel });
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
});
