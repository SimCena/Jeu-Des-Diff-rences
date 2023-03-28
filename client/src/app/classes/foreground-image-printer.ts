import { Injectable } from '@angular/core';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@common/constants/image';
import { Coordinate } from '@common/coordinate';
import { ImagePrinter } from './image-printer';

@Injectable({
    providedIn: 'root',
})
export class ForegroundImagePrinter extends ImagePrinter {
    private lastCoords: Coordinate;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.changeColor('black');
    }

    eraseCanvas(): void {
        this.context.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
    }

    draw(pos: Coordinate): void {
        if (this.context.globalCompositeOperation === 'destination-out') {
            this.eraseCoordinate(pos);
            this.drawIntermediatePoints(this.lastCoords, pos);
        } else {
            this.context.lineTo(pos.x, pos.y);
            this.context.stroke();
        }
        this.lastCoords = pos;
    }

    beginPath(pos: Coordinate): void {
        this.context.moveTo(pos.x, pos.y);
        this.context.beginPath();
        this.lastCoords = pos;
    }

    selectEraser(width: number): void {
        this.context.globalCompositeOperation = 'destination-out';
        this.setLineWidth(width);
    }

    selectPen(width: number): void {
        this.context.lineCap = 'round';
        this.context.lineJoin = 'round';
        this.context.globalCompositeOperation = 'source-over';
        this.setLineWidth(width);
    }

    changeColor(color: string): void {
        this.context.strokeStyle = color;
    }

    private setLineWidth(width: number): void {
        this.context.lineWidth = width;
    }

    private drawIntermediatePoints(lastCoord: Coordinate, currentCoord: Coordinate): void {
        if (this.findDistance(lastCoord, currentCoord) > 1) {
            const middlePoint: Coordinate = this.findMiddlePoint(lastCoord, currentCoord);
            this.eraseCoordinate(middlePoint);
            this.drawIntermediatePoints(lastCoord, middlePoint);
            this.drawIntermediatePoints(middlePoint, currentCoord);
        }
    }

    private eraseCoordinate(drawCoord: Coordinate): void {
        this.context.fillRect(
            Math.floor(drawCoord.x - this.context.lineWidth / 2),
            Math.floor(drawCoord.y - this.context.lineWidth / 2),
            this.context.lineWidth,
            this.context.lineWidth,
        );
    }

    private findMiddlePoint(start: Coordinate, end: Coordinate): Coordinate {
        return {
            x: (start.x + end.x) / 2,
            y: (start.y + end.y) / 2,
        };
    }

    private findDistance(start: Coordinate, end: Coordinate): number {
        return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    }
}
