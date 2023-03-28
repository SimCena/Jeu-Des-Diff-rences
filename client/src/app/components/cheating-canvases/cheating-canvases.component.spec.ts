/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BackgroundCanvasComponent } from '@app/components/background-canvas/background-canvas.component';
import { CheatingCanvasesComponent } from '@app/components/cheating-canvases/cheating-canvases.component';

describe('CheatingCanvasesComponent', () => {
    let component: CheatingCanvasesComponent;
    let fixture: ComponentFixture<CheatingCanvasesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CheatingCanvasesComponent, BackgroundCanvasComponent],
            imports: [HttpClientTestingModule, RouterTestingModule],
        }).compileComponents();

        fixture = TestBed.createComponent(CheatingCanvasesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('drawOnCanvas', () => {
        it('should call drawOnCanvasNumberArray', () => {
            const spy = spyOn(BackgroundCanvasComponent.prototype, 'drawOnCanvasNumberArray');
            component.drawOnCanvas([1, 2, 3]);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('drawCircleOnCanvas', () => {
        it('should call drawOnCanvasNumberArray', () => {
            const numberArraySpy = spyOn(BackgroundCanvasComponent.prototype, 'drawOnCanvasNumberArray');
            const circleSpy = spyOn(BackgroundCanvasComponent.prototype, 'drawCircleOnCanvas');

            component.drawCircleOnCanvas({ x: 0, y: 0 }, 0);
            expect(numberArraySpy).toHaveBeenCalled();
            expect(circleSpy).toHaveBeenCalled();
        });
    });

    describe('setIntervalDisplay', () => {
        it('should change isHidden after 250ms', () => {
            component['isHidden'] = false;
            component['isClueCanvas'] = false;
            jasmine.clock().install();
            component['setIntervalDisplay']();
            jasmine.clock().tick(251);
            expect(component['isHidden']).toBeTrue();
            jasmine.clock().uninstall();
        });
        it('should  keep isHidden to false after 250ms if it is a clueCanvas', () => {
            component['isHidden'] = false;
            component['isClueCanvas'] = true;
            jasmine.clock().install();
            component['setIntervalDisplay']();
            jasmine.clock().tick(251);
            expect(component['isHidden']).toBeFalse();
            jasmine.clock().uninstall();
        });
    });
});
