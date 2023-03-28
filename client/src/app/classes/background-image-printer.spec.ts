/* eslint-disable @typescript-eslint/no-explicit-any */
import { IMAGE_HEIGHT, IMAGE_WIDTH, BYTES_PER_RGBA_VALUE } from '@common/constants/image';
import { BackgroundImagePrinter } from './background-image-printer';
import { CanvasTestHelper } from './canvas-test-helper';

describe('BackgroundImagePrinter', () => {
    let imagePrinter: BackgroundImagePrinter;
    let canvas: HTMLCanvasElement;
    let blackData: number[];

    beforeEach(() => {
        canvas = CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT);
        imagePrinter = new BackgroundImagePrinter(canvas);
        blackData = [];
        for (let i = 0; i < IMAGE_WIDTH * BYTES_PER_RGBA_VALUE * IMAGE_HEIGHT; i++) {
            blackData.push(0);
        }
    });

    it('should create an instance', () => {
        expect(new BackgroundImagePrinter(canvas)).toBeTruthy();
    });

    describe('setFileReading', () => {
        it('should define image and fileReader', () => {
            expect(imagePrinter['image']).toBeDefined();
            expect(imagePrinter['fileReader']).toBeDefined();
        });

        it('should call contextDraw when image is loaded', async () => {
            const spy = spyOn<any>(imagePrinter, 'contextDraw');
            imagePrinter['image'].addEventListener('load', () => expect(spy).toHaveBeenCalled());
            imagePrinter['image'].dispatchEvent(new CustomEvent('load'));
        });

        it('should call imageLoading when fileReader is loaded', async () => {
            const spy = spyOn<any>(imagePrinter, 'imageLoading');
            imagePrinter['fileReader'].addEventListener('load', () => expect(spy).toHaveBeenCalled());
            imagePrinter['fileReader'].dispatchEvent(new CustomEvent('load'));
        });
    });

    describe('drawOnCanvasFile', () => {
        it('should call readAsDataURL from fileReader', () => {
            spyOn(imagePrinter['fileReader'], 'readAsDataURL');
            imagePrinter.drawOnCanvasFile(new File(['test'], 'test.txt'));
            expect(imagePrinter['fileReader'].readAsDataURL).toHaveBeenCalled();
        });
    });

    describe('drawOnCanvasNumberArray', () => {
        it('should call putImageData', () => {
            const ctx = imagePrinter['context'];
            spyOn(ctx, 'putImageData');
            imagePrinter.drawOnCanvasNumberArray(blackData);
            expect(ctx.putImageData).toHaveBeenCalled();
        });

        it('should call convertNumberToClampedArray', () => {
            const spy = spyOn<any>(imagePrinter, 'convertNumberToClampedArray').and.callThrough();
            imagePrinter.drawOnCanvasNumberArray(blackData);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('drawCircleOnCanvas', () => {
        it('should call arc', () => {
            const ctx = imagePrinter['context'];
            const spy = spyOn(ctx, 'arc');
            imagePrinter.drawCircleOnCanvas({ x: 0, y: 0 }, 1);
            expect(spy).toHaveBeenCalledWith(0, 0, 1, 0, 2 * Math.PI);
        });
    });

    describe('convertNumberToClampedArray', () => {
        it('should return array with the right length', () => {
            spyOn<any>(imagePrinter, 'convertNumberToClampedArray').and.callThrough();
            expect(imagePrinter['convertNumberToClampedArray'](blackData).length).toBe(blackData.length);
        });

        it('should convert number[] to Uint8ClampedArray', () => {
            spyOn<any>(imagePrinter, 'convertNumberToClampedArray').and.callThrough();
            expect(imagePrinter['convertNumberToClampedArray'](blackData).find((value, index) => value !== blackData[index])).toBeUndefined();
        });
    });

    describe('contextDraw', () => {
        it('should call drawImage with valid arguments', () => {
            const spy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
            imagePrinter['contextDraw']();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('imageLoading', () => {
        it('should take value from fileReader', async () => {
            await new Promise<void>((resolve) => {
                fetch(new Request('../../assets/images/test_complex_image.bmp'))
                    .then(async (response) => response.blob())
                    .then((blob) => {
                        imagePrinter.drawOnCanvasFile(new File([blob], 'test_image.bmp', { type: 'image/bmp' }));
                        imagePrinter['image'].addEventListener('load', () => resolve());
                    });
            });

            expect(imagePrinter['image'].src).toBe(imagePrinter['fileReader'].result as string);
        });
    });

    describe('drawAtopCanvas', () => {
        it('should call drawImage with right parameters', async () => {
            const spy = spyOn(imagePrinter['context'], 'drawImage');
            imagePrinter.drawAtopCanvas(await createImageBitmap(canvas));
            expect(spy).toHaveBeenCalled();
        });
    });
});
