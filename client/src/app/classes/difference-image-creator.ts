import { Injectable } from '@angular/core';
import { HALF_OPACITY, MAX_OPACITY } from '@app/constants/colors';
import { IMAGE_HEIGHT, IMAGE_WIDTH, BYTES_PER_RGBA_VALUE } from '@common/constants/image';
import { Difference } from '@common/games';

@Injectable({
    providedIn: 'root',
})
export class DifferenceImageCreator {
    static createDifferenceImage(differencesPositions: Difference[], isTransparent: boolean): number[] {
        const differenceArray: number[] = this.createTransparentImageArray();
        differencesPositions.forEach((difference) => {
            difference.positions.forEach((differenceIndex) => {
                this.modifyDifferencePixelRGBA(differenceIndex, differenceArray, isTransparent);
            });
        });
        return differenceArray;
    }

    static modifyDifferencePixelRGBA(index: number, differenceArray: number[], isTransparent: boolean): void {
        index = index * BYTES_PER_RGBA_VALUE;
        for (let i = 0; i < BYTES_PER_RGBA_VALUE - 1; i++) {
            differenceArray[index + i] = 0;
        }
        differenceArray[index + BYTES_PER_RGBA_VALUE - 1] = isTransparent ? HALF_OPACITY : MAX_OPACITY;
    }

    static createTransparentImageArray(): number[] {
        const transparentArray: number[] = new Array(IMAGE_HEIGHT * IMAGE_WIDTH * BYTES_PER_RGBA_VALUE);
        return transparentArray.fill(0, 0, IMAGE_HEIGHT * IMAGE_WIDTH * BYTES_PER_RGBA_VALUE);
    }
}
