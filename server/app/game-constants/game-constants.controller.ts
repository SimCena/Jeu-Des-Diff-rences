import { GameConstantsInput } from '@common/game-constants-input';
import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import fs from 'fs';

@Controller('constants')
export class GameConstantsController {
    @Get('/')
    @ApiOkResponse({
        description: 'Return game constants',
    })
    getGameConstants(): GameConstantsInput {
        return JSON.parse(fs.readFileSync('assets/constants.json', 'utf-8'));
    }

    @Put('/')
    @ApiCreatedResponse({
        description: 'Modified the game constants',
    })
    putGameConstants(@Body() body: GameConstantsInput) {
        fs.writeFileSync('./assets/constants.json', JSON.stringify(body), 'utf8');
    }
}
