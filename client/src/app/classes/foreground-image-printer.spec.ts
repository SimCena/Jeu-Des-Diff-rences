/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ForegroundImagePrinter } from '@app/classes/foreground-image-printer';
import { IMAGE_HEIGHT, IMAGE_WIDTH, BYTES_PER_RGBA_VALUE } from '@common/constants/image';

describe('ForegroundImagePrinter', () => {
    let imagePrinter: ForegroundImagePrinter;
    let canvas: HTMLCanvasElement;
    let blackData: number[];
    let clampedArray: Uint8ClampedArray;

    beforeEach(() => {
        canvas = CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT);
        clampedArray = new Uint8ClampedArray(IMAGE_WIDTH * BYTES_PER_RGBA_VALUE * IMAGE_HEIGHT);
        imagePrinter = new ForegroundImagePrinter(canvas);
        blackData = [];
        for (let i = 0; i < IMAGE_WIDTH * BYTES_PER_RGBA_VALUE * IMAGE_HEIGHT; i++) {
            blackData.push(0);
        }
        clampedArray.set(blackData);
    });

    it('should create an instance', () => {
        expect(new ForegroundImagePrinter(canvas)).toBeTruthy();
    });

    it('should call changeColor with the right parameters', () => {
        const spy = spyOn(ForegroundImagePrinter.prototype, 'changeColor');
        imagePrinter = new ForegroundImagePrinter(canvas);
        expect(spy).toHaveBeenCalledWith('black');
    });

    describe('eraseCanvas', () => {
        it('should erase canvas', () => {
            imagePrinter['context'].putImageData(new ImageData(clampedArray, IMAGE_WIDTH, IMAGE_HEIGHT), 0, 0);
            const beforeEraseData: ImageData | undefined = imagePrinter.getImageData();
            imagePrinter.eraseCanvas();
            expect(imagePrinter.getImageData()).not.toBe(beforeEraseData);
        });
    });

    describe('draw', () => {
        it('should set the value of lastCoords', () => {
            imagePrinter['lastCoords'] = { x: -1, y: -1 };
            imagePrinter.draw({ x: 1, y: 1 });
            expect(imagePrinter['lastCoords']).toEqual({ x: 1, y: 1 });
        });

        it('should call eraseCoordinates with right parameters for destination-out', () => {
            spyOn<any>(imagePrinter, 'drawIntermediatePoints');
            const spy = spyOn<any>(imagePrinter, 'eraseCoordinate');
            imagePrinter['context'].globalCompositeOperation = 'destination-out';
            imagePrinter.draw({ x: 1, y: 1 });
            expect(spy).toHaveBeenCalledWith({ x: 1, y: 1 });
        });

        it('should call drawIntermediatePoints with right parameters for destination-out', () => {
            const spy = spyOn<any>(imagePrinter, 'drawIntermediatePoints');
            imagePrinter['context'].globalCompositeOperation = 'destination-out';
            imagePrinter['lastCoords'] = { x: -1, y: -1 };
            imagePrinter.draw({ x: 1, y: 1 });
            expect(spy).toHaveBeenCalledWith({ x: -1, y: -1 }, { x: 1, y: 1 });
        });

        it('should call lineTo from context with right parameters for source-over', () => {
            const spy = spyOn(imagePrinter['context'], 'lineTo');
            imagePrinter['context'].globalCompositeOperation = 'source-over';
            imagePrinter.draw({ x: 1, y: 1 });
            expect(spy).toHaveBeenCalledWith(1, 1);
        });

        it('should call stroke from context for source-over', () => {
            const spy = spyOn(imagePrinter['context'], 'stroke');
            imagePrinter['context'].globalCompositeOperation = 'source-over';
            imagePrinter.draw({ x: 1, y: 1 });
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('beginPath', () => {
        it('should set the value of lastCoords', () => {
            imagePrinter['lastCoords'] = { x: -1, y: -1 };
            imagePrinter.beginPath({ x: 1, y: 1 });
            expect(imagePrinter['lastCoords']).toEqual({ x: 1, y: 1 });
        });

        it('should call move with the right parameters', () => {
            const spy = spyOn(imagePrinter['context'], 'moveTo');
            imagePrinter.beginPath({ x: 1, y: 1 });
            expect(spy).toHaveBeenCalledWith(1, 1);
        });

        it('should call beginPath', () => {
            const spy = spyOn(imagePrinter['context'], 'beginPath');
            imagePrinter.beginPath({ x: 1, y: 1 });
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('selectEraser', () => {
        it('should set globalCompositeOperation', () => {
            imagePrinter.selectEraser(1);
            expect(imagePrinter['context'].globalCompositeOperation).toEqual('destination-out');
        });

        it('should call setLineWidth with right parameters', () => {
            const spy = spyOn<any>(imagePrinter, 'setLineWidth');
            imagePrinter.selectEraser(2);
            expect(spy).toHaveBeenCalledWith(2);
        });
    });

    describe('selectPen', () => {
        it('should set globalCompositeOperation', () => {
            imagePrinter.selectPen(1);
            expect(imagePrinter['context'].globalCompositeOperation).toEqual('source-over');
        });

        it('should set lineCap', () => {
            imagePrinter.selectPen(1);
            expect(imagePrinter['context'].lineCap).toEqual('round');
        });

        it('should set lineJoin', () => {
            imagePrinter.selectPen(1);
            expect(imagePrinter['context'].lineJoin).toEqual('round');
        });

        it('should call setLineWidth with right parameters', () => {
            const spy = spyOn<any>(imagePrinter, 'setLineWidth');
            imagePrinter.selectPen(2);
            expect(spy).toHaveBeenCalledWith(2);
        });
    });

    describe('setLineWidth', () => {
        it('should set lineWidth', () => {
            imagePrinter['setLineWidth'](2);
            expect(imagePrinter['context'].lineWidth).toEqual(2);
        });
    });

    describe('changeColor', () => {
        it('should set strokeStyle', () => {
            imagePrinter.changeColor('#ffc0cb');
            expect(imagePrinter['context'].strokeStyle).toEqual('#ffc0cb');
        });
    });

    describe('findDistance', () => {
        it('should return the distance between two points #1', () => {
            expect(imagePrinter['findDistance']({ x: 0, y: 0 }, { x: 1, y: 1 })).toEqual(Math.sqrt(2));
        });

        it('should return the distance between two points #2', () => {
            expect(imagePrinter['findDistance']({ x: -1, y: -1 }, { x: 1, y: 1 })).toEqual(Math.sqrt(8));
        });

        it('should return the distance between two points #3', () => {
            expect(imagePrinter['findDistance']({ x: 3, y: 3 }, { x: 3, y: 3 })).toEqual(0);
        });
    });

    describe('findMiddlePoint', () => {
        it('should return the distance between two points #1', () => {
            expect(imagePrinter['findMiddlePoint']({ x: 3, y: 3 }, { x: 3, y: 3 })).toEqual({ x: 3, y: 3 });
        });

        it('should return the distance between two points #2', () => {
            expect(imagePrinter['findMiddlePoint']({ x: -1, y: -1 }, { x: 1, y: 1 })).toEqual({ x: 0, y: 0 });
        });

        it('should return the distance between two points #3', () => {
            expect(imagePrinter['findMiddlePoint']({ x: 4, y: 5 }, { x: 2, y: 3 })).toEqual({ x: 3, y: 4 });
        });
    });

    describe('eraseCoordinate', () => {
        it('should call fillRect from context with the right parameters', () => {
            const spy = spyOn(imagePrinter['context'], 'fillRect');
            imagePrinter['context'].lineWidth = 2;
            imagePrinter['eraseCoordinate']({ x: 2, y: 2 });
            expect(spy).toHaveBeenCalledWith(1, 1, 2, 2);
        });

        it('should floor the position of fillRect to avoid useless calculations', () => {
            const spy = spyOn(imagePrinter['context'], 'fillRect');
            imagePrinter['context'].lineWidth = 2;
            imagePrinter['eraseCoordinate']({ x: 1, y: 1 });
            expect(spy).toHaveBeenCalledWith(0, 0, 2, 2);
        });
    });

    describe('drawIntermediatePoints', () => {
        it('should call itself and eraseCoordinate the right number of times #1', () => {
            const eraseSpy = spyOn<any>(imagePrinter, 'eraseCoordinate');
            const recursiveSpy = spyOn<any>(imagePrinter, 'drawIntermediatePoints').and.callThrough();
            imagePrinter['drawIntermediatePoints']({ x: 0, y: 0 }, { x: 1, y: 1 });
            expect(eraseSpy).toHaveBeenCalledTimes(1);
            expect(recursiveSpy).toHaveBeenCalledTimes(3);
        });

        it('should call itself and eraseCoordinate the right number of times #2', () => {
            const eraseSpy = spyOn<any>(imagePrinter, 'eraseCoordinate');
            const recursiveSpy = spyOn<any>(imagePrinter, 'drawIntermediatePoints').and.callThrough();
            imagePrinter['drawIntermediatePoints']({ x: 2, y: 2 }, { x: 2, y: 2 });
            expect(eraseSpy).toHaveBeenCalledTimes(0);
            expect(recursiveSpy).toHaveBeenCalledTimes(1);
        });

        it('should call itself and eraseCoordinate the right number of times #3', () => {
            const eraseSpy = spyOn<any>(imagePrinter, 'eraseCoordinate');
            const recursiveSpy = spyOn<any>(imagePrinter, 'drawIntermediatePoints').and.callThrough();
            imagePrinter['drawIntermediatePoints']({ x: 2, y: 6 }, { x: 5, y: 5 });
            expect(eraseSpy).toHaveBeenCalledTimes(3);
            expect(recursiveSpy).toHaveBeenCalledTimes(7);
        });
    });
});
