/* eslint-disable @typescript-eslint/no-magic-numbers */
import { BLACK_RGBA_VALUE, MAX_NUMBER } from '@common/constants/detection';
import { IMAGE_SIZE } from '@common/constants/image';
import { Difference } from '@common/games';
import { Test, TestingModule } from '@nestjs/testing';
import { DetectionService } from './detection.service';

describe('DetectionService', () => {
    let service: DetectionService;
    const filledArray: number[] = new Array(IMAGE_SIZE);

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DetectionService],
        }).compile();
        filledArray.fill(MAX_NUMBER, 0, IMAGE_SIZE);
        service = module.get<DetectionService>(DetectionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('simplifyDataArray() should return a simplified array', () => {
        const rawRGBAData: number[] = new Array(8);
        for (let i = 0; i < 8; i++) {
            rawRGBAData[i] = i;
        }
        const expectedRGBAData: number[] = [66051, 67438087];
        expect(service['simplifyDataArray'](rawRGBAData)).toStrictEqual(expectedRGBAData);
    });

    it('simplifyDataArray() should return a simplified array of quarter size for big data array', () => {
        const rawRGBAData: number[] = new Array(IMAGE_SIZE);
        rawRGBAData.fill(0, 0, IMAGE_SIZE);
        expect(service['simplifyDataArray'](rawRGBAData).length).toStrictEqual(IMAGE_SIZE / 4);
    });

    it('addToDifferenceImage() should modify value if index is in valid range', () => {
        filledArray[1] = BLACK_RGBA_VALUE;
        const array: number[] = service['addToDifferenceImage'](1);
        expect(array).toStrictEqual(filledArray);
    });

    it('addToDifferenceImage() should modify value if index is at lower limit', () => {
        filledArray[0] = BLACK_RGBA_VALUE;
        const array: number[] = service['addToDifferenceImage'](0);
        expect(array).toStrictEqual(filledArray);
    });

    it('addToDifferenceImage() should modify value if index is at upper limit', () => {
        filledArray[IMAGE_SIZE - 1] = BLACK_RGBA_VALUE;
        const array: number[] = service['addToDifferenceImage'](IMAGE_SIZE - 1);
        expect(array).toStrictEqual(filledArray);
    });

    it('addToDifferenceImage() should not modify value if index is higher than upper limit', () => {
        const array: number[] = service['addToDifferenceImage'](IMAGE_SIZE);
        expect(array).toStrictEqual(filledArray);
    });

    it('addToDifferenceImage() should not modify value if index is not in valid range', () => {
        const array: number[] = service['addToDifferenceImage'](-1);
        expect(array).toStrictEqual(filledArray);
    });

    it('isPixelValid() should return true if both pixels are in the same line of the image', () => {
        expect(service['isPixelValid'](1, 2, 0)).toStrictEqual(true);
    });

    it('isPixelValid() should return false if the difference in rows of both pixels is not the same as expectedDifference', () => {
        expect(service['isPixelValid'](1, 2, 1)).toStrictEqual(false);
    });

    it('isPixelValid() should return true if the difference in rows of both pixels is the same as expectedDifference', () => {
        expect(service['isPixelValid'](1, 641, 1)).toStrictEqual(true);
    });

    it('isPixelValid() should return false if the new pixel index is not in valid range', () => {
        expect(service['isPixelValid'](1, -1, 1)).toStrictEqual(false);
    });

    it('modifyRadius() should modify internal private radius variable', () => {
        expect(service.modifyRadius(0)).toStrictEqual(0);
    });

    it('enlargeSidePixels() should expand the pixel to the left with radius more than 0 and isLeft set to true', () => {
        const expansionTestIndexes: number[] = [2, 641, 642, 1280, 1281, 1282, 1920, 1921, 1922, 2560, 2561, 2562, 3201, 3202, 3842];
        expansionTestIndexes.forEach((testIndex) => {
            filledArray[testIndex] = BLACK_RGBA_VALUE;
        });
        const array: number[] = service['enlargeSidePixels'](1923, true);
        expect(array).toStrictEqual(filledArray);
    });

    it('findDifferences() should find all differences in two separate arrays', () => {
        const differentArray: number[] = [...filledArray];
        const differentIndexes: number[] = [0, 641, 3842, 9000];
        differentIndexes.forEach((testIndex) => {
            differentArray[testIndex] = BLACK_RGBA_VALUE;
        });
        expect(service['findDifferences'](filledArray, differentArray)).toStrictEqual(differentIndexes);
    });

    it('enlargePixels() should expand different pixel', () => {
        const differentArray: number[] = [...filledArray];
        const differentIndexes: number[] = [
            2, 3, 4, 641, 642, 643, 644, 645, 1280, 1281, 1282, 1283, 1284, 1285, 1286, 1920, 1921, 1922, 1923, 1924, 1925, 1926, 2560, 2561, 2562,
            2563, 2564, 2565, 2566, 3201, 3202, 3203, 3204, 3205, 3842, 3843, 3844,
        ];
        differentArray[1923] = BLACK_RGBA_VALUE;
        service['findDifferences'](filledArray, differentArray);
        differentIndexes.forEach((testIndex) => {
            differentArray[testIndex] = BLACK_RGBA_VALUE;
        });
        expect(service['enlargePixels']()).toStrictEqual(differentArray);
    });

    it('enlargePixels() should expand pixel in corner ', () => {
        const differentArray: number[] = [...filledArray];
        const differentIndexes: number[] = [0, 1, 2, 3, 640, 641, 642, 643, 1280, 1281, 1282, 1920, 1921];
        differentArray[0] = BLACK_RGBA_VALUE;
        service['findDifferences'](filledArray, differentArray);
        differentIndexes.forEach((testIndex) => {
            differentArray[testIndex] = BLACK_RGBA_VALUE;
        });
        expect(service['enlargePixels']()).toStrictEqual(differentArray);
    });

    it('enlargePixels() should expand pixel in edges correctly', () => {
        const differentArray: number[] = [...filledArray];
        const differentIndexes: number[] = [
            638, 639, 1277, 1278, 1279, 1916, 1917, 1918, 1919, 2556, 2557, 2558, 2559, 3196, 3197, 3198, 3199, 3837, 3838, 3839, 4478, 4479,
        ];
        differentArray[2559] = BLACK_RGBA_VALUE;
        service['findDifferences'](filledArray, differentArray);
        differentIndexes.forEach((testIndex) => {
            differentArray[testIndex] = BLACK_RGBA_VALUE;
        });
        expect(service['enlargePixels']()).toStrictEqual(differentArray);
    });

    it('enlargePixels() should expand multiple pixels correctly', () => {
        const differentArray: number[] = [...filledArray];
        const differentIndexes: number[] = [
            0, 1, 2, 3, 640, 641, 642, 643, 1280, 1281, 1282, 1920, 1921, 638, 639, 1277, 1278, 1279, 1916, 1917, 1918, 1919, 2556, 2557, 2558, 2559,
            3196, 3197, 3198, 3199, 3837, 3838, 3839, 4478, 4479,
        ];
        differentArray[2559] = BLACK_RGBA_VALUE;
        differentArray[0] = BLACK_RGBA_VALUE;
        service['findDifferences'](filledArray, differentArray);
        differentIndexes.forEach((testIndex) => {
            differentArray[testIndex] = BLACK_RGBA_VALUE;
        });
        expect(service['enlargePixels']()).toStrictEqual(differentArray);
    });

    it('enlargePixels() should expand multiple overlapping pixels correctly', () => {
        const differentArray: number[] = [...filledArray];
        const differentIndexes: number[] = [
            2, 3, 4, 641, 642, 643, 644, 645, 1280, 1281, 1282, 1283, 1284, 1285, 1286, 1920, 1921, 1922, 1923, 1924, 1925, 1926, 2560, 2561, 2562,
            2563, 2564, 2565, 2566, 3201, 3202, 3203, 3204, 3205, 3842, 3843, 3844, 0, 1, 2, 3, 640, 641, 642, 643, 1280, 1281, 1282, 1920, 1921,
        ];
        differentArray[1923] = BLACK_RGBA_VALUE;
        differentArray[0] = BLACK_RGBA_VALUE;
        service['findDifferences'](filledArray, differentArray);
        differentIndexes.forEach((testIndex) => {
            differentArray[testIndex] = BLACK_RGBA_VALUE;
        });
        expect(service['enlargePixels']()).toStrictEqual(differentArray);
    });

    it('enlargePixels() should not expand pixel if radius is 0', () => {
        const differentArray: number[] = [...filledArray];
        service.modifyRadius(0);
        differentArray[1923] = BLACK_RGBA_VALUE;
        service['findDifferences'](filledArray, differentArray);
        expect(service['enlargePixels']()).toStrictEqual(differentArray);
    });

    it('countDifferences() should count correct number of differences if number of difference is 1', () => {
        const differentArray: number[] = [...filledArray];
        differentArray[1923] = BLACK_RGBA_VALUE;
        service['findDifferences'](filledArray, differentArray);
        service['enlargePixels']();
        expect(service['countDifferences']()).toStrictEqual(1);
    });

    it('countDifferences() should count correct number of differences if there is 2 not overlapping differences', () => {
        const differentArray: number[] = [...filledArray];
        differentArray[2559] = BLACK_RGBA_VALUE;
        differentArray[0] = BLACK_RGBA_VALUE;
        service['findDifferences'](filledArray, differentArray);
        service['enlargePixels']();
        expect(service['countDifferences']()).toStrictEqual(2);
    });

    it('countDifferences() should count correct number of differences if there is 2 overlapping differences on the edges', () => {
        const differentArray: number[] = [...filledArray];
        differentArray[1923] = BLACK_RGBA_VALUE;
        differentArray[0] = BLACK_RGBA_VALUE;
        service['findDifferences'](filledArray, differentArray);
        service['enlargePixels']();
        expect(service['countDifferences']()).toStrictEqual(1);
    });

    it('countDifferences() should count correct number of differences if there is 2 differences not on edges', () => {
        const differentArray: number[] = [...filledArray];
        differentArray[3205] = BLACK_RGBA_VALUE;
        differentArray[9605] = BLACK_RGBA_VALUE;
        service['findDifferences'](filledArray, differentArray);
        service['enlargePixels']();
        expect(service['countDifferences']()).toStrictEqual(2);
    });

    it('countDifferences() should count correct number of differences if there is 2 differences if radius is 15', () => {
        const differentArray: number[] = [...filledArray];
        differentArray[3205] = BLACK_RGBA_VALUE;
        differentArray[9605] = BLACK_RGBA_VALUE;
        service.modifyRadius(15);
        service['findDifferences'](filledArray, differentArray);
        service['enlargePixels']();
        expect(service['countDifferences']()).toStrictEqual(1);
    });

    it('countDifferences() should count correct number of differences if there is 2 adjacent differences if radius is 0', () => {
        const differentArray: number[] = [...filledArray];
        differentArray[0] = BLACK_RGBA_VALUE;
        differentArray[641] = BLACK_RGBA_VALUE;
        service.modifyRadius(0);
        service['findDifferences'](filledArray, differentArray);
        service['enlargePixels']();
        expect(service['countDifferences']()).toStrictEqual(1);
    });

    it('compareImages() should return the correct data when given two identical images', () => {
        const originalImage: number[] = new Array(IMAGE_SIZE * 4).fill(0, 0, IMAGE_SIZE * 4);
        const modifiedImage: number[] = new Array(IMAGE_SIZE * 4).fill(0, 0, IMAGE_SIZE * 4);
        const result: Difference[] = service.compareImages(originalImage, modifiedImage);
        expect(result).toStrictEqual([]);
    });

    it('compareImages() should return the correct data for two images with differences', () => {
        const originalImage: number[] = new Array(IMAGE_SIZE * 4).fill(0, 0, IMAGE_SIZE * 4);
        originalImage[0] = 1;
        originalImage[99] = 3;
        const modifiedImage: number[] = new Array(IMAGE_SIZE * 4).fill(0, 0, IMAGE_SIZE * 4);
        modifiedImage[32] = 2;
        modifiedImage[36] = 2;
        modifiedImage[99] = 3;
        const expectedResult: Difference[] = [
            { positions: [0, 1, 640, 641, 2, 642, 1280, 1281, 1282, 3, 643, 1920, 1921], differenceNumber: 0 },
            {
                positions: [
                    8, 7, 9, 647, 648, 649, 6, 646, 10, 650, 1286, 1287, 1288, 1289, 1290, 5, 645, 11, 651, 1291, 1927, 1928, 1929, 1930, 12, 652,
                ],
                differenceNumber: 1,
            },
        ];
        const result: Difference[] = service.compareImages(originalImage, modifiedImage);
        expect(result).toStrictEqual(expectedResult);
        expect(result.length).toStrictEqual(2);
    });
});
