import { Injectable } from '@angular/core';
import { ImagePrinter } from './image-printer';

@Injectable({
    providedIn: 'root',
})
export abstract class DrawingCanvas {
    protected imagePrinter: ImagePrinter;

    drawOnCanvasImageData(data: ImageData): void {
        this.imagePrinter.drawOnCanvasImageData(data);
    }

    getImageData(): ImageData {
        return this.imagePrinter.getImageData();
    }

    abstract eraseCanvas(): void;
}
