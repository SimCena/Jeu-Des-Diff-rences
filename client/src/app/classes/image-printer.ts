import { Injectable } from '@angular/core';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@common/constants/image';

@Injectable({
    providedIn: 'root',
})
export abstract class ImagePrinter {
    protected context: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.setContext(canvas);
    }

    drawOnCanvasImageData(data: ImageData): void {
        this.context.putImageData(data, 0, 0);
    }

    getImageData(): ImageData {
        return this.context.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
    }

    private setContext(canvas: HTMLCanvasElement): void {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.context = canvas.getContext('2d', {
            willReadFrequently: true,
        })!;
    }
}
