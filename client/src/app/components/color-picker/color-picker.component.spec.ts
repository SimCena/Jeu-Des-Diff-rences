/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GradientValue } from '@app/interfaces/gradient-value';
import * as COLOR_PICKER from '@app/constants/color-picker';

import { ColorPickerComponent } from './color-picker.component';
import { RGBA_BLACK, RGBA_BLACK_TRANSPARENT, RGBA_WHITE, RGBA_WHITE_TRANSPARENT } from '@app/constants/colors';

const gradientValues: GradientValue[] = [
    { color: RGBA_BLACK, colorPlacement: 0.1 },
    { color: RGBA_BLACK_TRANSPARENT, colorPlacement: 0.5 },
    { color: RGBA_WHITE_TRANSPARENT, colorPlacement: 0.5 },
    { color: RGBA_WHITE, colorPlacement: 0.9 },
];

const mouseEvent: MouseEvent = new MouseEvent('click');

describe('ColorPickerComponent', () => {
    let component: ColorPickerComponent;
    let fixture: ComponentFixture<ColorPickerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ColorPickerComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ColorPickerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngAfterViewInit', () => {
        it('should call drawGradient twice', () => {
            const spy = spyOn<any>(component, 'drawGradient');
            component.ngAfterViewInit();
            expect(spy).toHaveBeenCalledTimes(2);
        });
    });

    describe('drawGradient', () => {
        it('should draw the right gradient on the context', () => {
            component.context.fillStyle = 'red';
            component.context.fillRect(0, 0, COLOR_PICKER.WIDTH, COLOR_PICKER.HEIGHT);
            component['drawGradient'](gradientValues, 100, 100);
            expect(component.context.getImageData(0, 0, 1, 1).data).toEqual(new Uint8ClampedArray([0, 0, 0, 255]));
            expect(component.context.getImageData(100, 100, 1, 1).data).toEqual(new Uint8ClampedArray([255, 255, 255, 255]));
        });
    });

    describe('update', () => {
        it('should update the position', () => {
            spyOn<any>(component, 'updateColor');
            const spy = spyOn<any>(component, 'updatePosition');
            component['pickColor'](mouseEvent);
            expect(spy).toHaveBeenCalledWith(mouseEvent);
        });
        it('should update the color', () => {
            spyOn<any>(component, 'updatePosition');
            const spy = spyOn<any>(component, 'updateColor');
            component['pickColor'](mouseEvent);
            expect(spy).toHaveBeenCalled();
        });
        it('should make the color cursor visible if it is not', () => {
            spyOn<any>(component, 'updateColor');
            spyOn<any>(component, 'updatePosition');
            component['isCursorHidden'] = true;
            component['pickColor'](mouseEvent);
            expect(component['isCursorHidden']).toBeFalse();
        });
    });

    describe('updatePosition', () => {
        it('should update the position of the cursor', () => {
            component['updatePosition'](mouseEvent);
            expect(component['cursorPosition']).toEqual({ left: mouseEvent.offsetX + 'px', bottom: COLOR_PICKER.HEIGHT - mouseEvent.offsetY + 'px' });
        });
    });

    describe('updateColor', () => {
        it('should update the color', () => {
            component.context.fillStyle = 'red';
            component.context.fillRect(0, 0, COLOR_PICKER.WIDTH, COLOR_PICKER.HEIGHT);
            component['cursorPosition'] = { left: 50 + 'px', bottom: 50 + 'px' };
            component['updateColor'](mouseEvent);
            expect(component.currentColor).toEqual('rgb(255, 0, 0)');
        });
    });

    describe('clampedArrayToRGB', () => {
        it('should convert a clampedArray value to RGB value', () => {
            expect(component['clampedArrayToRGB'](new Uint8ClampedArray([243, 55, 3, 23]))).toEqual('rgb(243, 55, 3)');
        });
    });
});
