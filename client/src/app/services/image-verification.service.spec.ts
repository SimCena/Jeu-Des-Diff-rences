import { TestBed } from '@angular/core/testing';
import { ImageVerificationService } from './image-verification.service';

describe('ImageVerificationService', () => {
    let service: ImageVerificationService;
    let validImage: File;
    let wrongBitDepthImage: File;
    let wrongTypeImage: File;
    let wrongWidthImage: File;
    let wrongHeightImage: File;

    beforeEach(async () => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ImageVerificationService);

        const setImage = async (path: string, type: string): Promise<File> => {
            return new Promise<File>((resolve) => {
                fetch(new Request('../../assets/images/' + path))
                    .then(async (response) => response.blob())
                    .then((blob) => resolve(new File([blob], 'test_image.bmp', { type })));
            });
        };
        validImage = await setImage('test_complex_image.bmp', 'image/bmp');
        wrongBitDepthImage = await setImage('test_wrong_bit_depth.bmp', 'image/bmp');
        wrongTypeImage = await setImage('test_wrong_type.png', 'image/png');
        wrongWidthImage = await setImage('test_wrong_width.bmp', 'image/bmp');
        wrongHeightImage = await setImage('test_wrong_height.bmp', 'image/bmp');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('verifyImage', () => {
        it('should return true for a valid image', async () => {
            expect(await service.verifyImage(validImage)).toBeTrue();
        });

        it('should return false for an invalid bit depth', async () => {
            expect(await service.verifyImage(wrongBitDepthImage)).toBeFalse();
        });

        it('should return false for an invalid type', async () => {
            expect(await service.verifyImage(wrongTypeImage)).toBeFalse();
        });

        it('should return false for an invalid width', async () => {
            expect(await service.verifyImage(wrongWidthImage)).toBeFalse();
        });

        it('should return false for an invalid height', async () => {
            expect(await service.verifyImage(wrongHeightImage)).toBeFalse();
        });
    });
});
