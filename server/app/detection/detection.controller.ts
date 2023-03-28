import { Controller, Post, Body } from '@nestjs/common';
import { DetectionService } from './detection.service';
import { DifferenceImageParam } from '@common/difference-image-param';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { Difference } from '@common/games';

@Controller('differenceImage')
export class DetectionController {
    constructor(private readonly detectionService: DetectionService) {}

    @Post('')
    @ApiCreatedResponse({
        description: 'Repopulated DB.',
    })
    detectDifferences(@Body() body: DifferenceImageParam): Difference[] {
        this.detectionService.modifyRadius(body.radius);
        return this.detectionService.compareImages(Object.values(body.images[0].data), Object.values(body.images[1].data));
    }
}
