import { Component, AfterViewInit, Input, ElementRef, ViewChild } from '@angular/core';
import { BackgroundImagePrinter } from '@app/classes/background-image-printer';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@common/constants/image';
import { DrawingCanvas } from '@app/classes/drawing-canvas';
import { IdentifiableCanvas } from '@app/interfaces/identifiable-canvas';
import { CanvasId } from '@app/models/canvas-id';
import { Coordinate } from '@common/coordinate';
@Component({
    selector: 'app-background-canvas',
    templateUrl: './background-canvas.component.html',
    styleUrls: ['./background-canvas.component.scss'],
})
export class BackgroundCanvasComponent extends DrawingCanvas implements AfterViewInit, IdentifiableCanvas {
    @Input() canvasId: CanvasId;
    @ViewChild('canvas') canvasRef: ElementRef;
    protected imagePrinter: BackgroundImagePrinter;

    ngAfterViewInit() {
        this.canvasRef.nativeElement.width = IMAGE_WIDTH;
        this.canvasRef.nativeElement.height = IMAGE_HEIGHT;
        this.imagePrinter = new BackgroundImagePrinter(this.canvasRef.nativeElement);
    }

    getCanvasElement(): HTMLElement {
        return this.canvasRef.nativeElement;
    }

    drawOnCanvasFile(file: File): void {
        this.imagePrinter.drawOnCanvasFile(file);
    }

    drawOnCanvasNumberArray(data: number[]): void {
        this.imagePrinter.drawOnCanvasNumberArray(data);
    }

    drawCircleOnCanvas(position: Coordinate, radius: number): void {
        this.imagePrinter.drawCircleOnCanvas(position, radius);
    }

    drawAtopCanvas(data: ImageBitmap): void {
        this.imagePrinter.drawAtopCanvas(data);
    }

    eraseCanvas(): void {
        this.imagePrinter.whitenCanvas();
    }
}
