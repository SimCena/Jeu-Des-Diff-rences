/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';

import { MouseHandlerService } from './mouse-handler.service';

describe('MouseHandlerService', () => {
    let service: MouseHandlerService;

    const mouseEvent: MouseEvent = new MouseEvent('click');
    const canvas = document.createElement('canvas');

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MouseHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('update', () => {
        it('should call updateAbsolute', () => {
            spyOn<any>(service, 'updateRelative');
            const spy = spyOn<any>(service, 'updateAbsolute');
            service.update(mouseEvent, canvas);
            expect(spy).toHaveBeenCalledWith(mouseEvent);
        });
        it('should call updateRelative', () => {
            spyOn<any>(service, 'updateAbsolute');
            const spy = spyOn<any>(service, 'updateRelative');
            service.update(mouseEvent, canvas);
            expect(spy).toHaveBeenCalledWith(canvas);
        });
    });

    describe('updateAbsolute', () => {
        it('should update the absolute position', () => {
            service['absolutePosition'] = { x: 450, y: 240 };
            service['updateAbsolute'](mouseEvent);
            expect(service['absolutePosition']).toEqual({ x: mouseEvent.clientX, y: mouseEvent.clientY });
        });
    });

    describe('updateRelative', () => {
        it('should update the relative position', () => {
            service['absolutePosition'] = { x: 450, y: 240 };
            service['updateRelative'](canvas);
            expect(service.relativePosition).toEqual({
                x: service['absolutePosition'].x - canvas.getBoundingClientRect().left,
                y: service['absolutePosition'].y - canvas.getBoundingClientRect().top,
            });
        });
    });

    describe('getPositionAsCSS', () => {
        it('should return the proper css position if offset is defined', () => {
            service['absolutePosition'] = { x: 200, y: 200 };
            expect(service.getPositionAsCSS(true, { x: 45, y: 23 })).toEqual({
                left: '245px',
                top: '223px',
            });
        });
        it('should return the proper css position if offset is undefined', () => {
            service.relativePosition = { x: 200, y: 200 };
            expect(service.getPositionAsCSS(false)).toEqual({
                left: '200px',
                top: '200px',
            });
        });
    });
});
