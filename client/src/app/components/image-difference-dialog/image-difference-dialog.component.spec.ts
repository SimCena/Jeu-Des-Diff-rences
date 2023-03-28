/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from '@app/modules/material.module';
import { of } from 'rxjs';
import { ImageDifferenceDialogComponent } from './image-difference-dialog.component';
import { ImagePrinter } from '@app/classes/image-printer';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
class MockImagePrinter extends ImagePrinter {
    drawOnCanvasNumberArray() {
        return;
    }
}

const data = { differenceImage: [{ positions: [0, 0, 0, 0], differenceNumber: 0 }] };
describe('ImageDifferenceDialogComponent', () => {
    let component: ImageDifferenceDialogComponent;
    let fixture: ComponentFixture<ImageDifferenceDialogComponent>;
    let initImageSpy: jasmine.Spy;
    let drawImageOnCanvasSpy: jasmine.Spy;

    const dialogRefMock = {
        close: () => {},
        backdropClick: () => {
            return of(new MouseEvent('click'));
        },
        afterClosed: () => {
            return of(new MouseEvent('click'));
        },
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppMaterialModule, BrowserAnimationsModule],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        differenceImage: {
                            data,
                        },
                    },
                },
                { provide: MatDialogRef, useValue: dialogRefMock },
                { provide: ImagePrinter, useClass: MockImagePrinter },
            ],
            declarations: [ImageDifferenceDialogComponent],
        }).compileComponents();

        initImageSpy = spyOn<any>(ImageDifferenceDialogComponent.prototype, 'initImage');
        drawImageOnCanvasSpy = spyOn<any>(ImageDifferenceDialogComponent.prototype, 'drawImageOnCanvas');
        fixture = TestBed.createComponent(ImageDifferenceDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('constructor', () => {
        it('should call initDialog', () => {
            const initDialogSpy = spyOn<any>(ImageDifferenceDialogComponent.prototype, 'initDialog');
            TestBed.createComponent(ImageDifferenceDialogComponent);
            expect(initDialogSpy).toHaveBeenCalled();
        });
        it('should call initImage', () => {
            TestBed.createComponent(ImageDifferenceDialogComponent);
            expect(initImageSpy).toHaveBeenCalled();
        });
    });

    describe('initDialog', () => {
        it('should dismiss the snackbar when afterClosed is called on dialogRef', () => {
            const snackBarSpy = spyOn(component['snackBar'], 'dismiss');
            component['initDialog']();
            dialogRefMock.afterClosed();
            expect(snackBarSpy).toHaveBeenCalled();
        });
    });

    describe('initImage', () => {
        it('should call checkValidDifferences', () => {
            initImageSpy.and.callThrough();
            const checkValidDifferencesSpy = spyOn<any>(component, 'checkValidDifferences');
            component['initImage']();
            expect(checkValidDifferencesSpy).toHaveBeenCalled();
        });
        it('should call setBackgroundClick', () => {
            initImageSpy.and.callThrough();
            const setBackgroundClickSpy = spyOn<any>(component, 'setBackgroundClick');
            component['initImage']();
            expect(setBackgroundClickSpy).toHaveBeenCalled();
        });
    });

    describe('ngAfterViewInit', () => {
        it('should call checkValidDifferences', () => {
            component.ngAfterViewInit();
            expect(drawImageOnCanvasSpy).toHaveBeenCalled();
        });
    });

    describe('drawImageOnCanvas', () => {
        it('should call this.imagePrinter.drawOnCanvasNumberArray', () => {
            component['data'] = data;
            drawImageOnCanvasSpy.and.callThrough();
            const drawOnCanvasNumberArraySpy = spyOn(component['imagePrinter'], 'drawOnCanvasNumberArray');
            component['drawImageOnCanvas']();
            expect(drawOnCanvasNumberArraySpy).toHaveBeenCalled();
        });
    });

    describe('setBackgroundClick', () => {
        it('should close the dialog after a backdrop click', () => {
            const dialogRefCloseSpy = spyOn(component['dialogRef'], 'close');
            component['setBackgroundClick']();
            dialogRefMock.backdropClick();
            expect(dialogRefCloseSpy).toHaveBeenCalled();
        });
    });

    describe('checkValidDifferences', () => {
        it('should send an error message to the user if the error count is out of its valid range', () => {
            component['numberOfDifference'] = 2;
            const snackBarOpenSpy = spyOn(component['snackBar'], 'open');
            component['checkValidDifferences']();
            expect(snackBarOpenSpy).toHaveBeenCalledWith('Vous devez avoir entre 3 et 9 différences pour un jeu valide');
        });
        it('should send a confirmation message to the user if the error count is in its valid range', () => {
            component['numberOfDifference'] = 5;
            const snackBarOpenSpy = spyOn(component['snackBar'], 'open');
            component['checkValidDifferences']();
            expect(snackBarOpenSpy).toHaveBeenCalledWith('Jeu valide! Veuillez fermer la fenêtre.', undefined, { duration: 2000 });
        });
    });
});
