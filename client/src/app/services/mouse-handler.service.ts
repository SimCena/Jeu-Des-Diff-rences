import { Injectable } from '@angular/core';
import { CSSElement } from '@app/interfaces/css-element';
import { Coordinate } from '@common/coordinate';

@Injectable({
    providedIn: 'root',
})
export class MouseHandlerService {
    relativePosition: Coordinate;
    private absolutePosition: Coordinate;

    constructor() {
        this.initializePosition();
    }

    initializePosition(): void {
        this.absolutePosition = { x: 0, y: 0 };
        this.relativePosition = { x: 0, y: 0 };
    }

    update(mouseEvent: MouseEvent, canvas: HTMLElement): void {
        this.updateAbsolute(mouseEvent);
        this.updateRelative(canvas);
    }

    getPositionAsCSS(isAbsolute: boolean, offset?: Coordinate): CSSElement {
        if (!offset) offset = { x: 0, y: 0 };
        const position: Coordinate = isAbsolute ? this.absolutePosition : this.relativePosition;
        return {
            left: position.x + offset.x + 'px',
            top: position.y + offset.y + 'px',
        } as CSSElement;
    }

    private updateAbsolute(mouseEvent: MouseEvent): void {
        this.absolutePosition = {
            x: mouseEvent.clientX,
            y: mouseEvent.clientY,
        };
    }

    private updateRelative(canvas: HTMLElement): void {
        this.relativePosition = {
            x: this.absolutePosition.x - canvas.getBoundingClientRect().left,
            y: this.absolutePosition.y - canvas.getBoundingClientRect().top,
        };
    }
}
