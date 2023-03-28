/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Difference } from '@common/games';
import { DifferenceImageCreator } from './difference-image-creator';

describe('DifferenceImageCreator', () => {
    it('should create an instance', () => {
        expect(new DifferenceImageCreator()).toBeTruthy();
    });

    describe('modifyDifferencePixelRGBA', () => {
        it('should remove differences from array', () => {
            const array: number[] = [1, 2, 3, 4];
            DifferenceImageCreator.modifyDifferencePixelRGBA(0, array, true);
            expect(array).toEqual([0, 0, 0, 125]);
        });
    });

    it('should call modifyDifferencePixelRGBA from array', () => {
        const spy = spyOn(DifferenceImageCreator, 'modifyDifferencePixelRGBA');
        const difference: Difference = {
            positions: [1, 2, 3, 4, 5],
            differenceNumber: 0,
        };
        const difference2: Difference = {
            positions: [6, 7, 8, 9],
            differenceNumber: 1,
        };
        const differences = [difference, difference2];
        DifferenceImageCreator.createDifferenceImage(differences, false);
        expect(spy).toHaveBeenCalledTimes(difference.positions.length + difference2.positions.length);
    });
});
