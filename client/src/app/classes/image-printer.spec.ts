/* eslint-disable @typescript-eslint/no-explicit-any */
import { CanvasTestHelper } from './canvas-test-helper';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@common/constants/image';
import { ImagePrinter } from '@app/classes/image-printer';

class ChildImagePrinter extends ImagePrinter {}

describe('ImagePrinter', () => {
    let canvas: HTMLCanvasElement;

    beforeEach(() => {
        canvas = CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT);
    });

    it('should call setContext on construction', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(ImagePrinter.prototype, 'setContext');
        new ChildImagePrinter(canvas);
        expect(spy).toHaveBeenCalled();
    });

    describe('setContext', () => {
        it('should define context', () => {
            const printer = new ChildImagePrinter(canvas);
            printer['setContext'](canvas);
            expect(printer['context']).toBeDefined();
        });
    });

    describe('drawOnCanvasImageData', () => {
        it('should call putImageData', () => {
            const printer = new ChildImagePrinter(canvas);
            const spy = spyOn(printer['context'], 'putImageData');
            printer.drawOnCanvasImageData(printer['context'].createImageData(IMAGE_WIDTH, IMAGE_HEIGHT));
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('getImageData', () => {
        it('should call getImageData from context with right parameters', () => {
            const printer = new ChildImagePrinter(canvas);
            const spy = spyOn(printer['context'], 'getImageData');
            printer.getImageData();
            expect(spy).toHaveBeenCalledWith(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        });
    });
});
