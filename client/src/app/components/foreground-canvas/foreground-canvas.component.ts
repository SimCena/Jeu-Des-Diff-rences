import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DrawingCanvas } from '@app/classes/drawing-canvas';
import { ForegroundImagePrinter } from '@app/classes/foreground-image-printer';
import { IdentifiableCanvas } from '@app/interfaces/identifiable-canvas';
import { CanvasId } from '@app/models/canvas-id';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@common/constants/image';

@Component({
    selector: 'app-foreground-canvas',
    templateUrl: './foreground-canvas.component.html',
    styleUrls: ['./foreground-canvas.component.scss'],
})
export class ForegroundCanvasComponent extends DrawingCanvas implements AfterViewInit, IdentifiableCanvas {
    @Output() drawEvent = new EventEmitter<CanvasId>();
    @Input() canvasId: CanvasId;
    @ViewChild('canvas') private canvasRef: ElementRef;

    protected imagePrinter: ForegroundImagePrinter;
    protected mouseDown: boolean;

    constructor() {
        super();
        this.mouseDown = false;
        document.body.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });
    }

    ngAfterViewInit(): void {
        this.canvasRef.nativeElement.width = IMAGE_WIDTH;
        this.canvasRef.nativeElement.height = IMAGE_HEIGHT;
        this.imagePrinter = new ForegroundImagePrinter(this.canvasRef.nativeElement);
        this.eraseCanvas();
    }

    eraseCanvas(): void {
        this.imagePrinter.eraseCanvas();
    }

    selectEraser(width: number): void {
        this.imagePrinter.selectEraser(width);
    }

    selectPen(width: number): void {
        this.imagePrinter.selectPen(width);
    }

    changeColor(color: string): void {
        this.imagePrinter.changeColor(color);
    }

    async getImageBitmap(): Promise<ImageBitmap> {
        return createImageBitmap(this.canvasRef.nativeElement);
    }

    protected draw(mouseEvent: MouseEvent): void {
        if (this.mouseDown) this.imagePrinter.draw({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
    }

    protected mousePressed(mouseEvent: MouseEvent): void {
        this.mouseDown = true;
        this.imagePrinter.beginPath({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
        this.drawEvent.emit(this.canvasId);
        this.draw(mouseEvent);
    }

    protected mouseEnter(mouseEvent: MouseEvent): void {
        this.imagePrinter.beginPath({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
    }
}
