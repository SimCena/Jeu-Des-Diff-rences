/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForegroundCanvasComponent } from './foreground-canvas.component';

describe('ForegroundCanvasComponent', () => {
    let component: ForegroundCanvasComponent;
    let fixture: ComponentFixture<ForegroundCanvasComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ForegroundCanvasComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ForegroundCanvasComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set mouseDown to false on construction', () => {
        expect(component['mouseDown']).toBeFalse();
    });

    it('should set mouseDown to false on mouseup', () => {
        component['mouseDown'] = true;
        document.body.dispatchEvent(new Event('mouseup'));
        expect(component['mouseDown']).toBeFalse();
    });

    describe('ngAfterViewInit', () => {
        it('should define imagePrinter', () => {
            expect(component['imagePrinter']).toBeDefined();
        });

        it('should call eraseCanvas', () => {
            const spy = spyOn(component, 'eraseCanvas');
            component.ngAfterViewInit();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('eraseCanvas', () => {
        it('should call eraseCanvas from imagePrinter', () => {
            const spy = spyOn(component['imagePrinter'], 'eraseCanvas');
            component.eraseCanvas();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('selectEraser', () => {
        it('should call selectEraser from imagePrinter with right parameters', () => {
            const spy = spyOn(component['imagePrinter'], 'selectEraser');
            component.selectEraser(2);
            expect(spy).toHaveBeenCalledWith(2);
        });
    });

    describe('selectPen', () => {
        it('should call selectPen from imagePrinter with right parameters', () => {
            const spy = spyOn(component['imagePrinter'], 'selectPen');
            component.selectPen(2);
            expect(spy).toHaveBeenCalledWith(2);
        });
    });

    describe('changeColor', () => {
        it('should call changeColor from imagePrinter with right parameters', () => {
            const spy = spyOn(component['imagePrinter'], 'changeColor');
            component.changeColor('#FFFF00');
            expect(spy).toHaveBeenCalledWith('#FFFF00');
        });
    });

    describe('draw', () => {
        it('should call drawPixel from imagePrinter with right parameters if mouseDown is true', () => {
            component['mouseDown'] = true;
            const spy = spyOn(component['imagePrinter'], 'draw');
            const mouseEvent = new MouseEvent('mousemove');
            component['draw'](mouseEvent);
            expect(spy).toHaveBeenCalledWith({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
        });

        it('should do nothing if mouseDown is false', () => {
            component['mouseDown'] = false;
            const spy = spyOn(component['imagePrinter'], 'draw');
            component['draw'](new MouseEvent('mousemove'));
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('mousePressed', () => {
        it('should set mouseDown to true', () => {
            component['mouseDown'] = false;
            const mouseEvent = new MouseEvent('mousemove');
            component['mousePressed'](mouseEvent);
            expect(component['mouseDown']).toBeTrue();
        });

        it('should call beginPath from imagePrinter with right parameters', () => {
            const spy = spyOn(component['imagePrinter'], 'beginPath');
            const mouseEvent = new MouseEvent('mousemove');
            component['mousePressed'](mouseEvent);
            expect(spy).toHaveBeenCalledWith({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
        });
    });

    describe('mouseEnter', () => {
        it('should call beginPath from imagePrinter with right parameters', () => {
            const spy = spyOn(component['imagePrinter'], 'beginPath');
            const mouseEvent = new MouseEvent('mousemove');
            component['mouseEnter'](mouseEvent);
            expect(spy).toHaveBeenCalledWith({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
        });
    });

    describe('getImageBitMap', () => {
        it('should return the right bitmap', async () => {
            const expectedBitMap = await createImageBitmap(component['canvasRef'].nativeElement);
            expect(await component.getImageBitmap()).toEqual(expectedBitMap);
        });
    });
});
