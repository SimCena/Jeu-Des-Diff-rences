import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@common/constants/image';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BackgroundImagePrinter } from '@app/classes/background-image-printer';
import { MAX_DIFFERENCE_COUNT, MIN_DIFFERENCE_COUNT } from '@app/constants/game';
import { Difference } from '@common/games';
import { DifferenceImageCreator } from '@app/classes/difference-image-creator';

@Component({
    selector: 'app-image-difference-dialog',
    templateUrl: './image-difference-dialog.component.html',
    styleUrls: ['./image-difference-dialog.component.scss'],
})
export class ImageDifferenceDialogComponent implements AfterViewInit {
    @ViewChild('popUpCanvas') private popUpCanvas: ElementRef;

    protected image: Uint8ClampedArray;
    protected numberOfDifference: number;
    protected validDifferences: boolean;

    private canvas: HTMLCanvasElement;
    private imagePrinter: BackgroundImagePrinter;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { differenceImage: Difference[] },
        protected dialogRef: MatDialogRef<ImageDifferenceDialogComponent>,
        private snackBar: MatSnackBar,
    ) {
        this.initDialog();
        this.initImage();
    }

    ngAfterViewInit(): void {
        this.canvas = this.popUpCanvas.nativeElement;
        this.canvas.width = IMAGE_WIDTH;
        this.canvas.height = IMAGE_HEIGHT;
        this.imagePrinter = new BackgroundImagePrinter(this.canvas);
        this.drawImageOnCanvas();
    }

    protected closeDialog(): void {
        this.dialogRef.close(this.validDifferences);
    }

    private initDialog(): void {
        this.dialogRef.disableClose = true;
        this.dialogRef.afterClosed().subscribe(() => {
            this.snackBar.dismiss();
        });
    }

    private initImage(): void {
        this.numberOfDifference = this.data.differenceImage.length;
        this.checkValidDifferences();
        this.setBackgroundClick();
    }

    private drawImageOnCanvas(): void {
        this.imagePrinter.drawOnCanvasNumberArray(DifferenceImageCreator.createDifferenceImage(this.data.differenceImage, false));
    }

    private setBackgroundClick(): void {
        this.dialogRef.backdropClick().subscribe(() => {
            this.closeDialog();
        });
    }

    private checkValidDifferences(): void {
        this.validDifferences = this.numberOfDifference >= MIN_DIFFERENCE_COUNT && this.numberOfDifference <= MAX_DIFFERENCE_COUNT;
        if (!this.validDifferences) {
            this.snackBar.open('Vous devez avoir entre ' + MIN_DIFFERENCE_COUNT + ' et ' + MAX_DIFFERENCE_COUNT + ' différences pour un jeu valide');
        } else {
            this.snackBar.open('Jeu valide! Veuillez fermer la fenêtre.', undefined, { duration: 2000 });
        }
    }
}
