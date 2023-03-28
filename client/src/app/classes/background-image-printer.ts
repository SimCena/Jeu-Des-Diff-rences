import { Injectable } from '@angular/core';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@common/constants/image';
import { ImagePrinter } from '@app/classes/image-printer';
import { Coordinate } from '@common/coordinate';
import { BLACK_STROKE_COLOR, CIRCLE_STROKE_WIDTH, ORANGE_STROKE_COLOR } from '@app/constants/clues';

@Injectable({
    providedIn: 'root',
})
export class BackgroundImagePrinter extends ImagePrinter {
    private image: HTMLImageElement;
    private fileReader: FileReader;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.setFileReading();
        this.whitenCanvas();
    }

    drawOnCanvasFile(file: File): void {
        this.fileReader.readAsDataURL(file);
    }

    drawOnCanvasNumberArray(data: number[]) {
        this.context.putImageData(new ImageData(this.convertNumberToClampedArray(data), IMAGE_WIDTH, IMAGE_HEIGHT), 0, 0);
    }

    drawAtopCanvas(data: ImageBitmap): void {
        this.context.globalCompositeOperation = 'source-atop';
        this.context.drawImage(data, 0, 0);
        this.context.globalCompositeOperation = 'source-over';
    }

    drawCircleOnCanvas(position: Coordinate, radius: number): void {
        this.context.strokeStyle = ORANGE_STROKE_COLOR;
        const lineWidth = this.context.lineWidth;
        this.context.lineWidth = CIRCLE_STROKE_WIDTH;
        this.context.beginPath();
        this.context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
        this.context.stroke();
        this.context.strokeStyle = BLACK_STROKE_COLOR;
        this.context.lineWidth = lineWidth;
    }

    whitenCanvas(): void {
        this.context.fillStyle = 'white';
        this.context.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
    }

    private setFileReading(): void {
        this.fileReader = new FileReader();
        this.image = new Image();

        this.fileReader.addEventListener('load', () => this.imageLoading());

        this.image.addEventListener('load', () => this.contextDraw());
    }

    private imageLoading(): void {
        this.image.src = this.fileReader.result as string;
    }

    private contextDraw(): void {
        this.context.drawImage(this.image, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
    }

    private convertNumberToClampedArray(data: number[]): Uint8ClampedArray {
        const image: Uint8ClampedArray = new Uint8ClampedArray(data.length);
        image.set(data);
        return image;
    }
}
