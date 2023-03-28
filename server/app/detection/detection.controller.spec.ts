import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@common/constants/image';
import { DifferenceImageParam } from '@common/difference-image-param';
import { Test, TestingModule } from '@nestjs/testing';
import { DetectionController } from './detection.controller';
import { DetectionService } from './detection.service';

describe('DetectionController', () => {
    let controller: DetectionController;
    let service: DetectionService;
    let differenceImageParam: DifferenceImageParam;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DetectionController],
            providers: [DetectionService],
        }).compile();

        controller = module.get<DetectionController>(DetectionController);
        service = module.get<DetectionService>(DetectionService);

        differenceImageParam = {
            images: [
                {
                    data: new Uint8ClampedArray([0, 0, 0, 0]),
                    colorSpace: 'display-p3',
                    height: IMAGE_HEIGHT,
                    width: IMAGE_WIDTH,
                },
                {
                    data: new Uint8ClampedArray([0, 0, 0, 0]),
                    colorSpace: 'display-p3',
                    height: IMAGE_HEIGHT,
                    width: IMAGE_WIDTH,
                },
            ],
            radius: 3,
        };
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('A post request to the detection controller should call modifyRadius from detectionService', () => {
        const modifyRadiusSpy = jest.spyOn(service, 'modifyRadius').mockImplementation();
        jest.spyOn(service, 'compareImages').mockImplementation();
        controller.detectDifferences(differenceImageParam);
        expect(modifyRadiusSpy).toHaveBeenCalledWith(3);
    });

    it('A post request to the detection controller should call compareImages from detectionService', () => {
        jest.spyOn(service, 'modifyRadius').mockImplementation();
        const compareImagesSpy = jest.spyOn(service, 'compareImages').mockImplementation();
        controller.detectDifferences(differenceImageParam);
        expect(compareImagesSpy).toHaveBeenCalledWith(
            Object.values(differenceImageParam.images[0].data),
            Object.values(differenceImageParam.images[1].data),
        );
    });
});
