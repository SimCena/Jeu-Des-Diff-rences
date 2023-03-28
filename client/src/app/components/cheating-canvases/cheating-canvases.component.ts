import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { DifferenceImageCreator } from '@app/classes/difference-image-creator';
import { BackgroundCanvasComponent } from '@app/components/background-canvas/background-canvas.component';
import { MILLISECONDS_IN_QUARTER_SECOND } from '@app/constants/constants';
import { Coordinate } from '@common/coordinate';

@Component({
    selector: 'app-cheating-canvases',
    templateUrl: './cheating-canvases.component.html',
    styleUrls: ['./cheating-canvases.component.scss'],
})
export class CheatingCanvasesComponent implements AfterViewInit {
    @Input() isClueCanvas: boolean;
    @ViewChild('cheatCanvas') private cheatCanvas: BackgroundCanvasComponent;
    protected isHidden: boolean;

    constructor() {
        this.isHidden = true;
    }

    ngAfterViewInit(): void {
        this.setIntervalDisplay();
    }

    drawOnCanvas(array: number[]) {
        this.cheatCanvas.drawOnCanvasNumberArray(array);
    }

    drawCircleOnCanvas(position: Coordinate, radius: number): void {
        this.cheatCanvas.drawOnCanvasNumberArray(DifferenceImageCreator.createTransparentImageArray());
        this.cheatCanvas.drawCircleOnCanvas(position, radius);
    }

    private setIntervalDisplay(): void {
        setInterval(() => {
            this.isHidden = this.isClueCanvas ? false : !this.isHidden;
        }, MILLISECONDS_IN_QUARTER_SECOND);
    }
}
