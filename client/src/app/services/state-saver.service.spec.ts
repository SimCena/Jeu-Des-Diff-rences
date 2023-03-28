/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { CanvasId } from '@app/models/canvas-id';

import { StateSaverService } from '@app/services/state-saver.service';

describe('StateSaverService', () => {
    let service: StateSaverService;
    let fakeImageData: ImageData;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(StateSaverService);
        fakeImageData = new ImageData(1, 1);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize states and iterator', () => {
        expect(service['states']).toEqual([]);
        expect(service['iterator']).toEqual(-1);
    });

    describe('saveState', () => {
        it('should push a new state to the states', () => {
            service.saveState(CanvasId.ORIGINAL, fakeImageData);
            expect(service['states'].length).toBe(1);
            expect(service['states'][0]).toEqual({ id: CanvasId.ORIGINAL, data: fakeImageData });
        });

        it('should increment iterator', () => {
            service['iterator'] = 3;
            service.saveState(CanvasId.ORIGINAL, fakeImageData);
            expect(service['iterator']).toBe(4);
        });

        it('should remove all elements beyond the iterator', () => {
            for (let i = 0; i < 5; i++) {
                service['states'].push({ id: CanvasId.ORIGINAL, data: fakeImageData });
            }
            service['iterator'] = 1;
            service.saveState(CanvasId.ORIGINAL, fakeImageData);
            expect(service['states'].length).toBe(3);
        });
    });

    describe('cancelState', () => {
        it('should call cancelStateId', () => {
            const spy = spyOn(service, 'cancelStateId');
            service.cancelState(fakeImageData);
            expect(spy).toHaveBeenCalled();
        });

        it('should return undefined for undefined lastTouchedId', () => {
            spyOn(service, 'cancelStateId').and.returnValue(undefined);
            service['iterator'] = 1;
            expect(service.cancelState(fakeImageData)).toBeUndefined();
        });

        it('should return undefined for negative iterator', () => {
            spyOn(service, 'cancelStateId').and.returnValue(CanvasId.ORIGINAL);
            service['iterator'] = -1;
            expect(service.cancelState(fakeImageData)).toBeUndefined();
        });

        it('should decrement iterator', () => {
            spyOn<any>(service, 'updateStates');
            spyOn(service, 'cancelStateId').and.returnValue(CanvasId.ORIGINAL);
            service['iterator'] = 1;
            service.cancelState(fakeImageData);
            expect(service['iterator']).toBe(0);
        });

        it('should call updateStates with the right values', () => {
            for (let i = 0; i < 2; i++) {
                service['states'].push({ id: CanvasId.ORIGINAL, data: fakeImageData });
            }
            spyOn(service, 'cancelStateId').and.returnValue(CanvasId.ORIGINAL);
            service['iterator'] = 1;
            const spy = spyOn<any>(service, 'updateStates');
            service.cancelState(fakeImageData);
            expect(spy).toHaveBeenCalledWith(CanvasId.ORIGINAL, fakeImageData, 1);
        });
    });

    describe('redoState', () => {
        it('should call redoStateId', () => {
            const spy = spyOn(service, 'redoStateId');
            service.redoState(fakeImageData);
            expect(spy).toHaveBeenCalled();
        });

        it('should return undefined for undefined lastTouchedId', () => {
            spyOn(service, 'redoStateId').and.returnValue(undefined);
            service['iterator'] = 1;
            expect(service.redoState(fakeImageData)).toBeUndefined();
        });

        it('should increment iterator', () => {
            spyOn<any>(service, 'updateStates');
            spyOn(service, 'redoStateId').and.returnValue(CanvasId.ORIGINAL);
            service['iterator'] = 1;
            service.redoState(fakeImageData);
            expect(service['iterator']).toBe(2);
        });

        it('should call updateStates with the right values', () => {
            for (let i = 0; i < 2; i++) {
                service['states'].push({ id: CanvasId.ORIGINAL, data: fakeImageData });
            }
            spyOn(service, 'redoStateId').and.returnValue(CanvasId.ORIGINAL);
            service['iterator'] = 1;
            const spy = spyOn<any>(service, 'updateStates');
            service.redoState(fakeImageData);
            expect(spy).toHaveBeenCalledWith(CanvasId.ORIGINAL, fakeImageData, 2);
        });
    });

    describe('cancelStateId', () => {
        it('should return undefined for empty states', () => {
            service['states'] = [];
            expect(service.cancelStateId()).toBeUndefined();
        });

        it('should return the id of the element pointed by the iterator', () => {
            for (let i = 0; i < 5; i++) {
                service['states'].push({ id: CanvasId.ORIGINAL, data: fakeImageData });
            }
            service['states'][2] = { id: CanvasId.MODIFIED, data: fakeImageData };
            service['iterator'] = 2;
            expect(service.cancelStateId()).toBe(CanvasId.MODIFIED);
        });
    });

    describe('redoStateId', () => {
        beforeEach(async () => {
            for (let i = 0; i < 5; i++) {
                service['states'].push({ id: CanvasId.ORIGINAL, data: fakeImageData });
            }
        });

        it('should return undefined for empty states', () => {
            service['states'] = [];
            expect(service.redoStateId()).toBeUndefined();
        });

        it('should return if the element above the iterator is undefined', () => {
            service['iterator'] = 4;
            expect(service.redoStateId()).toBeUndefined();
        });

        it('should return the id of the element pointed by the iterator', () => {
            service['states'][2] = { id: CanvasId.MODIFIED, data: fakeImageData };
            service['iterator'] = 1;
            expect(service.redoStateId()).toBe(CanvasId.MODIFIED);
        });
    });

    describe('updateStates', () => {
        beforeEach(async () => {
            for (let i = 0; i < 5; i++) {
                service['states'].push({ id: CanvasId.ORIGINAL, data: fakeImageData });
            }
        });

        it('should return the right state', () => {
            service['states'][2] = { id: CanvasId.MODIFIED, data: fakeImageData };
            service['iterator'] = 2;
            expect(service['updateStates'](CanvasId.ORIGINAL, fakeImageData, service['iterator']).id).toBe(CanvasId.MODIFIED);
        });

        it('should modify the state pointed by the iterator', () => {
            service['iterator'] = 2;
            service['updateStates'](CanvasId.MODIFIED, fakeImageData, service['iterator']);
            expect(service['states'][service['iterator']].id).toBe(CanvasId.MODIFIED);
        });
    });
});
