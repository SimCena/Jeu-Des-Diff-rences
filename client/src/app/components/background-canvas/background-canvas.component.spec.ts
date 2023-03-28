import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BackgroundCanvasComponent } from './background-canvas.component';

describe('BackgroundCanvasComponent', () => {
    let component: BackgroundCanvasComponent;
    let fixture: ComponentFixture<BackgroundCanvasComponent>;
    let fakeFile: File;
    let fakeImageData: ImageData;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BackgroundCanvasComponent],
        }).compileComponents();

        fakeFile = new File([''], 'filename');
        fakeImageData = new ImageData(1, 1);
        fixture = TestBed.createComponent(BackgroundCanvasComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('getCanvasElement', () => {
        it('should return the canvas native element', () => {
            expect(component.getCanvasElement()).toBe(component.canvasRef.nativeElement);
        });
    });

    describe('drawOnCanvasFile', () => {
        it('should call drawOnCanvasFile from imagePrinter class', () => {
            const drawOnCanvasFileSpy = spyOn(component['imagePrinter'], 'drawOnCanvasFile');
            component.drawOnCanvasFile(fakeFile);
            expect(drawOnCanvasFileSpy).toHaveBeenCalledWith(fakeFile);
        });
    });

    describe('drawCircleOnCanvas', () => {
        it('should call drawCircleOnCanvas from imagePrinter class', () => {
            const drawCircleOnCanvasSpy = spyOn(component['imagePrinter'], 'drawCircleOnCanvas');
            component.drawCircleOnCanvas({ x: 0, y: 0 }, 0);
            expect(drawCircleOnCanvasSpy).toHaveBeenCalledWith({ x: 0, y: 0 }, 0);
        });
    });

    describe('drawOnCanvasNumberArray', () => {
        it('should call drawOnCanvasNumberArray from imagePrinter class', () => {
            const drawOnCanvasFileSpy = spyOn(component['imagePrinter'], 'drawOnCanvasNumberArray');
            component.drawOnCanvasNumberArray([1, 2, 3]);
            expect(drawOnCanvasFileSpy).toHaveBeenCalledWith([1, 2, 3]);
        });
    });

    describe('drawOnCanvasImageData', () => {
        it('should call drawOnCanvasImageData from imagePrinter class', () => {
            const drawOnCanvasFileSpy = spyOn(component['imagePrinter'], 'drawOnCanvasImageData');
            component.drawOnCanvasImageData(fakeImageData);
            expect(drawOnCanvasFileSpy).toHaveBeenCalledWith(fakeImageData);
        });
    });

    describe('eraseCanvas', () => {
        it('should call whitenCanvas from imagePrinter class', () => {
            const drawOnCanvasFileSpy = spyOn(component['imagePrinter'], 'whitenCanvas');
            component.eraseCanvas();
            expect(drawOnCanvasFileSpy).toHaveBeenCalled();
        });
    });

    describe('getImageData', () => {
        it('should call getImageData from imagePrinter class', () => {
            const drawOnCanvasFileSpy = spyOn(component['imagePrinter'], 'getImageData');
            component.getImageData();
            expect(drawOnCanvasFileSpy).toHaveBeenCalled();
        });
    });
});
