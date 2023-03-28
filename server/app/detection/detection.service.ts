import { BLACK_RGBA_VALUE, DEFAULT_RADIUS, MAX_NUMBER, NEIGHBOR_PIXELS, SHIFT_8_BITS } from '@common/constants/detection';
import { IMAGE_SIZE, IMAGE_WIDTH, BYTES_PER_RGBA_VALUE } from '@common/constants/image';
import { Difference } from '@common/games';
import { Injectable } from '@nestjs/common';
import { DifferenceImage } from '@app/interfaces/difference-image';

@Injectable()
export class DetectionService {
    private differences: DifferenceImage;
    private radius: number;

    constructor() {
        this.initializeDifferences();
        this.radius = DEFAULT_RADIUS;
    }

    modifyRadius(newRadius: number): number {
        this.radius = newRadius;
        return this.radius;
    }

    compareImages(originalImageRaw: number[], modifiedImageRaw: number[]): Difference[] {
        this.initializeDifferences();
        this.findDifferences(this.simplifyDataArray(originalImageRaw), this.simplifyDataArray(modifiedImageRaw));
        this.enlargePixels();
        return this.sortDifferenceArray(this.countDifferences());
    }

    private initializeDifferences(): void {
        this.differences = {
            image: new Array(IMAGE_SIZE).fill(MAX_NUMBER, 0, IMAGE_SIZE),
            indexes: [],
            seen: new Map<number, number>(),
        };
    }

    private sortDifferenceArray(count: number): Difference[] {
        const sortedDifferenceArray: Difference[] = [];
        for (let i = 0; i < count; i++) {
            sortedDifferenceArray.push({ differenceNumber: i, positions: new Array() });
        }
        this.differences.seen.forEach((differenceNumber: number, position: number) => {
            sortedDifferenceArray.at(differenceNumber).positions.push(position);
        });
        return sortedDifferenceArray;
    }

    private findDifferences(originalImage: number[], modifiedImage: number[]): number[] {
        for (let i = 0; i < IMAGE_SIZE; i++) {
            if (originalImage[i] !== modifiedImage[i]) {
                this.addToDifferenceImage(i);
                this.differences.indexes.push(i);
            }
        }
        return this.differences.indexes;
    }

    private simplifyDataArray(imageData: number[]): number[] {
        const simplifiedData: number[] = [];
        let temporaryValue = 0;

        imageData.forEach((pixel, i) => {
            if (i % BYTES_PER_RGBA_VALUE === 0 && i !== 0) {
                simplifiedData.push(temporaryValue);
                temporaryValue = pixel;
            } else {
                temporaryValue *= SHIFT_8_BITS;
                temporaryValue += pixel;
            }
        });
        simplifiedData.push(temporaryValue);
        return simplifiedData;
    }

    private addToDifferenceImage(index: number): number[] {
        if (this.isPixelWithinSize(index)) {
            this.differences.image[index] = BLACK_RGBA_VALUE;
        }
        return this.differences.image;
    }

    private addSidePixels(shift: number, pixel: number): void {
        this.addToDifferenceImage(pixel + shift * IMAGE_WIDTH);
        this.addToDifferenceImage(pixel - shift * IMAGE_WIDTH);
    }

    private enlargePixels(): number[] {
        this.differences.indexes.forEach((index: number) => {
            this.enlargeSidePixels(index, true);
            this.enlargeSidePixels(index, false);
            for (let j = 0; j <= this.radius; j++) {
                this.addSidePixels(j, index);
            }
        });
        return this.differences.image;
    }

    private enlargeSidePixels(index: number, isLeft: boolean): number[] {
        let enlargedPixel: number;
        for (let i = 1; i <= this.radius; i++) {
            enlargedPixel = index + (isLeft ? -i : i);
            if (this.isPixelValid(index, enlargedPixel, 0)) {
                for (let j = 0; j <= this.radius + 1 - i; j++) {
                    this.addSidePixels(j, enlargedPixel);
                }
            } else break;
        }
        return this.differences.image;
    }

    private getIndexRow(index: number): number {
        return Math.floor(index / IMAGE_WIDTH);
    }

    private isPixelWithinSize(index: number): boolean {
        return index >= 0 && index < IMAGE_SIZE;
    }

    private isPixelValid(index: number, neighborIndex: number, expectedDifference: number): boolean {
        if (!this.isPixelWithinSize(neighborIndex)) {
            return false;
        }
        return Math.abs(this.getIndexRow(index) - this.getIndexRow(neighborIndex)) === expectedDifference;
    }

    private countDifferences(): number {
        let differenceCount = 0;
        this.differences.indexes.forEach((index: number) => {
            if (!this.differences.seen.has(index)) {
                this.iterativeCount(index, differenceCount);
                differenceCount++;
            }
        });
        return differenceCount;
    }

    private iterativeCount(index: number, differenceCount: number): void {
        const pixelQueue: number[] = new Array();
        pixelQueue.push(index);
        this.differences.seen.set(index, differenceCount);
        while (pixelQueue.length > 0) {
            index = pixelQueue[0];
            NEIGHBOR_PIXELS.forEach((neighborPixel) => {
                const neighbor: number = index + neighborPixel;
                const rowDifference = Math.abs(neighborPixel) === 1 ? 0 : 1;
                if (this.isPixelValidAndUnseen(index, neighbor, rowDifference)) {
                    pixelQueue.push(neighbor);
                    this.differences.seen.set(neighbor, differenceCount);
                }
            });
            pixelQueue.shift();
        }
    }

    private isPixelValidAndUnseen(index: number, neighbor: number, rowDifference: number): boolean {
        return (
            this.isPixelValid(index, neighbor, rowDifference) &&
            this.differences.image[neighbor] === BLACK_RGBA_VALUE &&
            !this.differences.seen.has(neighbor)
        );
    }
}
