/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DifferenceImageCreator } from '@app/classes/difference-image-creator';
import { CheatingCanvasesComponent } from '@app/components/cheating-canvases/cheating-canvases.component';
import { CanvasId } from '@app/models/canvas-id';
import { Difference } from '@common/games';
import { of } from 'rxjs';
import { CheatingModeService } from '@app/services/cheating-mode.service';
import { CommunicationService } from '@app/services/communication.service';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@common/constants/image';
import { Coordinate } from '@common/coordinate';

const difference: Difference = {
    positions: [1, 2, 3, 4, 5],
    differenceNumber: 0,
};
const difference2: Difference = {
    positions: [6, 7, 8, 9],
    differenceNumber: 1,
};
const difference3: Difference = {
    positions: [641, 642, 643, 644],
    differenceNumber: 2,
};
const differences = [difference, difference2];

describe('CheatingModeService', () => {
    let service: CheatingModeService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [CommunicationService],
        });
        service = TestBed.inject(CheatingModeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('setCheatingCanvases', () => {
        it('should set private canvases references', () => {
            spyOn<any>(service, 'getDifferencesPositions');
            const cheatingCanvas: CheatingCanvasesComponent = new CheatingCanvasesComponent();
            service.setCheatingCanvases(CanvasId.ORIGINAL, cheatingCanvas);
            service.setCheatingCanvases(CanvasId.MODIFIED, cheatingCanvas);

            expect(service['originalCheatingCanvas']).toEqual(cheatingCanvas);
        });
    });

    describe('setCheatingCanvases', () => {
        it('should set private canvases references', () => {
            spyOn<any>(service, 'getDifferencesPositions');
            const cheatingCanvas: CheatingCanvasesComponent = new CheatingCanvasesComponent();
            service.setCheatingCanvases(CanvasId.ORIGINAL, cheatingCanvas);
            service.setCheatingCanvases(CanvasId.MODIFIED, cheatingCanvas);
            service.setClueCanvases(CanvasId.ORIGINAL, cheatingCanvas);
            service.setClueCanvases(CanvasId.MODIFIED, cheatingCanvas);

            expect(service['originalClueCanvas']).toEqual(cheatingCanvas);
        });
    });

    describe('getDifferencesPositions', () => {
        it('should call getDifferencesPositions from communication service', () => {
            spyOn(CommunicationService.prototype, 'getDifferencesPositions').and.returnValue(of(differences));
            spyOn<any>(service, 'setDifferencesOnCanvas');
            service['getDifferencesPositions']();
            expect(service['differences']).toEqual(differences);
        });
        it('should call getDifferencesPositions from communication service', () => {
            const spy = spyOn(CommunicationService.prototype, 'getDifferencesPositions').and.returnValue(of(differences));
            spyOn<any>(service, 'setDifferencesOnCanvas');
            service['getDifferencesPositions']();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('updateDifferences', () => {
        it('should remove differences from array', () => {
            service['differences'] = differences;
            spyOn<any>(service, 'setDifferencesOnCanvas');
            service['updateDifferences'](0);
            expect(service['differences']).toEqual([difference2]);
        });
        it('should call setDifferencesOnCanvas', () => {
            service['differences'] = differences;
            const spy = spyOn<any>(service, 'setDifferencesOnCanvas');
            service['updateDifferences'](0);
            expect(spy).toHaveBeenCalled();
        });
    });
    describe('setDifferencesOnCanvas', () => {
        it('should call modifyDifferencePixelRGBA from array', () => {
            service['differences'] = [difference, difference2];
            const spy = spyOn(DifferenceImageCreator, 'createDifferenceImage');
            spyOn<any>(service, 'drawOnCheatingCanvases');
            service['setDifferencesOnCanvas']();
            expect(spy).toHaveBeenCalled();
        });
        it('should call drawOnCheatingCanvases', () => {
            service['differences'] = differences;
            spyOn(DifferenceImageCreator, 'createDifferenceImage');
            const spy = spyOn<any>(service, 'drawOnCheatingCanvases');
            service['setDifferencesOnCanvas']();
            expect(spy).toHaveBeenCalled();
        });
    });
    describe('drawOnCheatingCanvases', () => {
        it('should call drawOnCanvas array', () => {
            const cheatingCanvas: CheatingCanvasesComponent = new CheatingCanvasesComponent();
            service.setCheatingCanvases(CanvasId.ORIGINAL, cheatingCanvas);
            service.setCheatingCanvases(CanvasId.MODIFIED, cheatingCanvas);

            const spy = spyOn(cheatingCanvas, 'drawOnCanvas');
            service['drawOnCheatingCanvases']([1, 2, 3]);
            expect(spy).toHaveBeenCalledTimes(2);
        });
    });

    describe('drawOnCheatingCanvases', () => {
        it('should call drawOnCanvas array', () => {
            const cheatingCanvas: CheatingCanvasesComponent = new CheatingCanvasesComponent();
            service.setCheatingCanvases(CanvasId.ORIGINAL, cheatingCanvas);
            service.setCheatingCanvases(CanvasId.MODIFIED, cheatingCanvas);
            service.setClueCanvases(CanvasId.ORIGINAL, cheatingCanvas);
            service.setClueCanvases(CanvasId.MODIFIED, cheatingCanvas);
            const spy = spyOn(cheatingCanvas, 'drawOnCanvas');
            service['drawOnCheatingCanvases']([1, 2, 3]);
            expect(spy).toHaveBeenCalledTimes(2);
        });
    });

    describe('drawOnClueCanvases', () => {
        it('should call drawOnClueCanvases array', () => {
            const cheatingCanvas: CheatingCanvasesComponent = new CheatingCanvasesComponent();
            service.setCheatingCanvases(CanvasId.ORIGINAL, cheatingCanvas);
            service.setCheatingCanvases(CanvasId.MODIFIED, cheatingCanvas);
            service.setClueCanvases(CanvasId.ORIGINAL, cheatingCanvas);
            service.setClueCanvases(CanvasId.MODIFIED, cheatingCanvas);
            const spy = spyOn(cheatingCanvas, 'drawOnCanvas');
            service['drawOnClueCanvases']([1, 2, 3]);
            expect(spy).toHaveBeenCalledTimes(2);
        });
    });

    describe('getClue', () => {
        it('should call getClueQuadrant if clueLeft is 3', () => {
            spyOn<any>(service, 'drawOnClueCanvases');
            const spy = spyOn<any>(service, 'getClueQuadrant');
            spyOn<any>(service, 'setQuadrantPixelsOnCanvas');
            service.cluesLeft = 3;
            service['getClue']();
            expect(spy).toHaveBeenCalledWith(false);
        });
        it('should call getClueQuadrant with true if clueLeft is 2', () => {
            spyOn<any>(service, 'drawOnClueCanvases');
            const spy = spyOn<any>(service, 'getClueQuadrant');
            spyOn<any>(service, 'setQuadrantPixelsOnCanvas');
            service.cluesLeft = 2;
            service['getClue']();
            expect(spy).toHaveBeenCalledWith(true);
        });
        it('should call drawOnClueCanvases if clueLeft is 1', () => {
            const cheatingCanvas: CheatingCanvasesComponent = new CheatingCanvasesComponent();
            service.setClueCanvases(CanvasId.ORIGINAL, cheatingCanvas);
            service.setClueCanvases(CanvasId.MODIFIED, cheatingCanvas);
            const spy = spyOn<any>(CheatingCanvasesComponent.prototype, 'drawCircleOnCanvas');
            service['differences'] = [difference];
            service.cluesLeft = 1;
            service['getClue']();
            expect(spy).toHaveBeenCalledTimes(2);
        });
        it('clueLeft should be 0 after call with 1 clue left', () => {
            spyOn<any>(service, 'drawThirdClue');
            spyOn<any>(service, 'drawOnClueCanvases');
            service['differences'] = [difference];
            service.cluesLeft = 1;
            service['getClue']();
            expect(service.cluesLeft).toEqual(0);
        });
        it('clueLeft should not be -1 after call with 0 clue left', () => {
            spyOn<any>(service, 'drawOnClueCanvases');
            service['differences'] = [difference];
            service.cluesLeft = 0;
            service['getClue']();
            expect(service.cluesLeft).toEqual(0);
        });
    });

    describe('getDifferenceCoords', () => {
        it('should a position between', () => {
            service['differences'] = [difference3];
            const pixelCoordsResult: Coordinate = service['getDifferenceCoords']();
            expect(pixelCoordsResult.x).toBeGreaterThanOrEqual(0);
            expect(pixelCoordsResult.x).toBeLessThanOrEqual(639);
            expect(pixelCoordsResult.y).toBeGreaterThanOrEqual(0);
            expect(pixelCoordsResult.y).toBeLessThanOrEqual(479);
        });
    });

    describe('getClueQuadrant', () => {
        it('should return 0 if coords passed are in first quadrant', () => {
            spyOn<any>(service, 'getDifferenceCoords').and.returnValue({ x: 2, y: 1 });
            expect(service['getClueQuadrant'](false)).toEqual(0);
        });
        it('should return 1 if coords passed are in second quadrant', () => {
            spyOn<any>(service, 'getDifferenceCoords').and.returnValue({ x: 638, y: 1 });
            expect(service['getClueQuadrant'](false)).toEqual(1);
        });
        it('should return 2 if coords passed are in third quadrant', () => {
            spyOn<any>(service, 'getDifferenceCoords').and.returnValue({ x: 1, y: 470 });
            expect(service['getClueQuadrant'](false)).toEqual(2);
        });
        it('should return 3 if coords passed are in fourth quadrant', () => {
            spyOn<any>(service, 'getDifferenceCoords').and.returnValue({ x: 638, y: 470 });
            expect(service['getClueQuadrant'](false)).toEqual(3);
        });
    });

    describe('getClueQuadrant with SubQuadrant', () => {
        it('should return 0 if coords passed are in first subquadrant', () => {
            spyOn<any>(service, 'getDifferenceCoords').and.returnValue({ x: 0, y: 0 });
            expect(service['getClueQuadrant'](true)).toEqual(0);
        });
        it('should return 1 if coords passed are in second subquadrant', () => {
            spyOn<any>(service, 'getDifferenceCoords').and.returnValue({ x: 310, y: 2 });
            expect(service['getClueQuadrant'](true)).toEqual(1);
        });
        it('should return 3 if coords passed are in fourth subquadrant', () => {
            spyOn<any>(service, 'getDifferenceCoords').and.returnValue({ x: 555, y: 330 });
            expect(service['getClueQuadrant'](true)).toEqual(11);
        });
        it('should return 14 if coords passed are in fifteenth subquadrant', () => {
            spyOn<any>(service, 'getDifferenceCoords').and.returnValue({ x: 321, y: 470 });
            expect(service['getClueQuadrant'](true)).toEqual(14);
        });
        it('should return 15 if coords passed are in sixteenth subquadrant', () => {
            spyOn<any>(service, 'getDifferenceCoords').and.returnValue({ x: 639, y: 479 });
            expect(service['getClueQuadrant'](true)).toEqual(15);
        });
    });

    describe('setQuadrantPixelsOnCanvas', () => {
        it('modifyDifferencePixelRGBA should be call the right amount of times if we want to draw a quadrant', () => {
            const spy = spyOn(DifferenceImageCreator, 'modifyDifferencePixelRGBA');
            spyOn<any>(service, 'drawOnClueCanvases');
            const dividersPerRow = 2;
            service['setQuadrantPixelsOnCanvas'](0, dividersPerRow);
            expect(spy).toHaveBeenCalledTimes((IMAGE_HEIGHT * IMAGE_WIDTH) / (dividersPerRow * dividersPerRow));
        });
        it('modifyDifferencePixelRGBA should be call the right amount of times if we want to draw a subquadrant', () => {
            const spy = spyOn(DifferenceImageCreator, 'modifyDifferencePixelRGBA');
            spyOn<any>(service, 'drawOnClueCanvases');
            const dividersPerRow = 4;
            service['setQuadrantPixelsOnCanvas'](0, dividersPerRow);
            expect(spy).toHaveBeenCalledTimes((IMAGE_HEIGHT * IMAGE_WIDTH) / (dividersPerRow * dividersPerRow));
        });
        it('modifyDifferencePixelRGBA should be call the right amount of times if we want to draw a subquadrant', () => {
            spyOn(DifferenceImageCreator, 'modifyDifferencePixelRGBA');
            const spy = spyOn<any>(service, 'drawOnClueCanvases');
            const dividersPerRow = 4;
            service['setQuadrantPixelsOnCanvas'](0, dividersPerRow);
            expect(spy).toHaveBeenCalled();
        });
    });
});
