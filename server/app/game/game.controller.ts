import { GameService } from '@app/game/game.service';
import { GameClient } from '@common/games';
import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { GameData } from '@common/game-data';

@Controller('games')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Get('/')
    @ApiOkResponse({
        description: 'Return all games',
    })
    getGames(): GameClient[] {
        return this.gameService.getClientGames();
    }

    @Get('/:id')
    @ApiOkResponse({
        description: 'Return differencesPositions',
    })
    getDifferencesPositions(@Param('id') id: string) {
        return this.gameService.getDifferencesPositions(parseInt(id, 10));
    }

    @Put('/')
    @ApiCreatedResponse({
        description: '',
    })
    async addGame(@Body() body: GameData): Promise<boolean> {
        return await this.gameService.addGame({
            gameName: body.gameName,
            originalImage: Object.values(body.originalImage.data),
            modifiedImage: Object.values(body.modifiedImage.data),
            differenceImage: body.differenceImage,
        });
    }
}
