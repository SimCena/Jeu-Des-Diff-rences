/* eslint-disable @typescript-eslint/no-empty-function */
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@common/constants/image';
import { CanvasTestHelper } from './canvas-test-helper';
import { DrawingCanvas } from './drawing-canvas';
import { ForegroundImagePrinter } from './foreground-image-printer';
import { ImagePrinter } from './image-printer';

class ChildDrawingCanvas extends DrawingCanvas {
    eraseCanvas(): void {}
}

describe('DrawingCanvas', () => {
    let canvas: ChildDrawingCanvas;
    let imagePrinter: ImagePrinter;
    let data: ImageData;

    beforeEach(async () => {
        data = new ImageData(IMAGE_WIDTH, IMAGE_HEIGHT);
        canvas = new ChildDrawingCanvas();
        imagePrinter = new ForegroundImagePrinter(CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT));
        canvas['imagePrinter'] = imagePrinter;
    });
    describe('drawOnCanvasImageData', () => {
        it('should call drawOnCanvasImageData from imagePrinter with right parameters', () => {
            const spy = spyOn(canvas['imagePrinter'], 'drawOnCanvasImageData');
            canvas.drawOnCanvasImageData(data);
            expect(spy).toHaveBeenCalledWith(data);
        });
    });

    describe('getImageData', () => {
        it('should return getImageData from imagePrinter', () => {
            spyOn(canvas['imagePrinter'], 'getImageData').and.returnValue(data);
            expect(canvas.getImageData()).toBe(data);
        });
    });
});
