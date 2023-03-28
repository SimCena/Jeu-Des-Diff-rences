import { Injectable } from '@angular/core';
import { DifferenceImageCreator } from '@app/classes/difference-image-creator';
import { CheatingCanvasesComponent } from '@app/components/cheating-canvases/cheating-canvases.component';
import { Difference } from '@common/games';
import { CommunicationService } from '@app/services/communication.service';
import { GameRequestsService } from '@app/services/game-requests.service';
import { QUADRANT_PER_ROW, SUB_QUADRANT_PER_ROW, THIRD_CLUE_RADIUS } from '@app/constants/clues';
import { Coordinate } from '@common/coordinate';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@common/constants/image';
import { CanvasId } from '@app/models/canvas-id';

@Injectable({
    providedIn: 'root',
})
export class CheatingModeService {
    cluesLeft: number;

    private differences: Difference[];
    private originalCheatingCanvas: CheatingCanvasesComponent;
    private modifiedCheatingCanvas: CheatingCanvasesComponent;
    private originalClueCanvas: CheatingCanvasesComponent;
    private modifiedClueCanvas: CheatingCanvasesComponent;

    constructor(private communicationService: CommunicationService, private gameRequestsService: GameRequestsService) {}

    setCheatingCanvases(canvasId: CanvasId, canvas: CheatingCanvasesComponent): void {
        if (canvasId === CanvasId.ORIGINAL) {
            this.originalCheatingCanvas = canvas;
        } else if (canvasId === CanvasId.MODIFIED) {
            this.modifiedCheatingCanvas = canvas;
        }
    }

    initClues(): void {
        this.cluesLeft = 3;
    }

    setClueCanvases(canvasId: CanvasId, canvas: CheatingCanvasesComponent): void {
        if (canvasId === CanvasId.ORIGINAL) {
            this.originalClueCanvas = canvas;
        } else if (canvasId === CanvasId.MODIFIED) {
            this.modifiedClueCanvas = canvas;
        }
    }

    updateDifferences(differenceNumber: number): void {
        if (this.differences.find((difference) => difference.differenceNumber === differenceNumber))
            this.differences.splice(
                this.differences.findIndex((index) => {
                    return index.differenceNumber === differenceNumber;
                }),
                1,
            );
        this.setDifferencesOnCanvas();
    }

    getClue(): void {
        switch (this.cluesLeft) {
            case 3:
                this.setQuadrantPixelsOnCanvas(this.getClueQuadrant(false), QUADRANT_PER_ROW);
                break;
            case 2:
                this.setQuadrantPixelsOnCanvas(this.getClueQuadrant(true), SUB_QUADRANT_PER_ROW);
                break;
            case 1:
                this.drawThirdClue(this.getMeanCoords());
                break;
            case 0:
                return;
        }
        this.cluesLeft--;
    }

    getDifferencesPositions(): void {
        this.communicationService.getDifferencesPositions(this.gameRequestsService.currentGameId).subscribe((differences) => {
            this.differences = differences;
            this.setDifferencesOnCanvas();
        });
    }
    private getMeanCoords(): Coordinate {
        const meanCoords: Coordinate = {
            x: 0,
            y: 0,
        };
        this.differences[0].positions.forEach((index) => {
            meanCoords.x += index % IMAGE_WIDTH;
            meanCoords.y += Math.floor(index / IMAGE_WIDTH);
        });
        meanCoords.x = meanCoords.x / this.differences[0].positions.length;
        meanCoords.y = meanCoords.y / this.differences[0].positions.length;
        return meanCoords;
    }

    private getDifferenceCoords(): Coordinate {
        const randomIndex = Math.floor(Math.random() * this.differences[0].positions.length);
        return {
            x: this.differences[0].positions[randomIndex] % IMAGE_WIDTH,
            y: Math.floor(this.differences[0].positions[randomIndex] / IMAGE_WIDTH),
        };
    }

    private getClueQuadrant(isSubQuadrant: boolean): number {
        const dividersPerRow: number = isSubQuadrant ? SUB_QUADRANT_PER_ROW : QUADRANT_PER_ROW;
        const differencePixelCoords: Coordinate = this.getDifferenceCoords();
        return (
            Math.floor((differencePixelCoords.x * dividersPerRow) / IMAGE_WIDTH) +
            Math.floor((differencePixelCoords.y * dividersPerRow) / IMAGE_HEIGHT) * dividersPerRow
        );
    }

    private setDifferencesOnCanvas(): void {
        this.drawOnCheatingCanvases(DifferenceImageCreator.createDifferenceImage(this.differences, true));
    }

    private setQuadrantPixelsOnCanvas(quadrant: number, dividersPerRow: number): void {
        const quadrantArray: number[] = DifferenceImageCreator.createTransparentImageArray();
        const rowHeight: number = IMAGE_HEIGHT / dividersPerRow;
        const colWidth: number = IMAGE_WIDTH / dividersPerRow;
        const minColumn: number = colWidth * (quadrant % dividersPerRow);
        const minRow: number = (rowHeight / dividersPerRow) * (quadrant - (quadrant % dividersPerRow));
        for (let i = 0; i < colWidth; i++) {
            for (let j = 0; j < rowHeight; j++) {
                DifferenceImageCreator.modifyDifferencePixelRGBA((j + minRow) * IMAGE_WIDTH + i + minColumn, quadrantArray, true);
            }
        }
        this.drawOnClueCanvases(quadrantArray);
    }

    private drawOnClueCanvases(quadrantArray: number[]): void {
        this.modifiedClueCanvas.drawOnCanvas(quadrantArray);
        this.originalClueCanvas.drawOnCanvas(quadrantArray);
    }

    private drawThirdClue(meanCoords: Coordinate): void {
        this.modifiedClueCanvas.drawCircleOnCanvas(meanCoords, THIRD_CLUE_RADIUS);
        this.originalClueCanvas.drawCircleOnCanvas(meanCoords, THIRD_CLUE_RADIUS);
    }

    private drawOnCheatingCanvases(differenceArray: number[]): void {
        this.modifiedCheatingCanvas.drawOnCanvas(differenceArray);
        this.originalCheatingCanvas.drawOnCanvas(differenceArray);
    }
}
