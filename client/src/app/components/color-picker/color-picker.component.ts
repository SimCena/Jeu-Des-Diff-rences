/* eslint-disable @typescript-eslint/no-magic-numbers */
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CSSElement } from '@app/interfaces/css-element';
import { GradientValue } from '@app/interfaces/gradient-value';
import * as COLORS from '@app/constants/colors';
import * as COLOR_PICKER from '@app/constants/color-picker';
import {
    BLACK_POSITION,
    BLACK_TRANSPARENT_POSITION,
    BLUE_POSITION,
    CYAN_POSITION,
    GREEN_POSITION,
    MAGENTA_POSITION,
    RED_POSITION,
    WHITE_POSITION,
    WHITE_TRANSPARENT_POSITION,
    YELLOW_POSITION,
} from '@app/constants/color-picker';

@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent implements AfterViewInit {
    @ViewChild('canvas') canvasRef: ElementRef;
    context: CanvasRenderingContext2D;
    currentColor: string;

    protected isCursorHidden: boolean;
    protected cursorPosition: CSSElement;

    private readonly colorGradientValues: GradientValue[];
    private readonly blackAndWhiteValues: GradientValue[];

    constructor() {
        this.currentColor = COLORS.RGBA_BLACK;
        this.isCursorHidden = true;
        this.colorGradientValues = [
            { color: COLORS.RGB_RED, colorPlacement: RED_POSITION },
            { color: COLORS.RGB_YELLOW, colorPlacement: YELLOW_POSITION },
            { color: COLORS.RGB_GREEN, colorPlacement: GREEN_POSITION },
            { color: COLORS.RGB_CYAN, colorPlacement: CYAN_POSITION },
            { color: COLORS.RGB_BLUE, colorPlacement: BLUE_POSITION },
            { color: COLORS.RGB_MAGENTA, colorPlacement: MAGENTA_POSITION },
        ];
        this.blackAndWhiteValues = [
            { color: COLORS.RGBA_WHITE, colorPlacement: WHITE_POSITION },
            { color: COLORS.RGBA_WHITE_TRANSPARENT, colorPlacement: WHITE_TRANSPARENT_POSITION },
            { color: COLORS.RGBA_BLACK_TRANSPARENT, colorPlacement: BLACK_TRANSPARENT_POSITION },
            { color: COLORS.RGBA_BLACK, colorPlacement: BLACK_POSITION },
        ];
    }

    ngAfterViewInit(): void {
        [this.canvasRef.nativeElement.height, this.canvasRef.nativeElement.width] = [COLOR_PICKER.HEIGHT, COLOR_PICKER.WIDTH];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.context = this.canvasRef.nativeElement.getContext('2d', {
            willReadFrequently: true,
        })!;
        this.drawGradient(this.colorGradientValues, COLOR_PICKER.WIDTH, 0);
        this.drawGradient(this.blackAndWhiteValues, 0, COLOR_PICKER.HEIGHT);
    }

    protected pickColor(mouseEvent: MouseEvent): void {
        this.updatePosition(mouseEvent);
        this.updateColor(mouseEvent);
        this.isCursorHidden = false;
    }

    protected clampedArrayToRGB(arr: Uint8ClampedArray): string {
        return `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`;
    }

    private drawGradient(gradientValues: GradientValue[], width: number, height: number): void {
        const gradient = this.context.createLinearGradient(0, 0, width, height);
        for (const gradientValue of gradientValues) gradient.addColorStop(gradientValue.colorPlacement, gradientValue.color);
        this.context.fillStyle = gradient;
        this.context.fillRect(0, 0, COLOR_PICKER.WIDTH, COLOR_PICKER.HEIGHT);
    }

    private updatePosition(mouseEvent: MouseEvent): void {
        this.cursorPosition = { left: mouseEvent.offsetX + 'px', bottom: COLOR_PICKER.HEIGHT - mouseEvent.offsetY + 'px' } as CSSElement;
    }

    private updateColor(mouseEvent: MouseEvent): void {
        this.currentColor = this.clampedArrayToRGB(this.context.getImageData(mouseEvent.offsetX, mouseEvent.offsetY, 1, 1).data);
    }
}
