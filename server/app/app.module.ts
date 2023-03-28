import { GameConstantsController } from '@app/game-constants/game-constants.controller';
import { GameController } from '@app/game/game.controller';
import { GameService } from '@app/game/game.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DetectionController } from './detection/detection.controller';
import { DetectionService } from './detection/detection.service';
import { GameManager } from './game-manager/game-manager.service';
import { GameGateway } from './gateways/socket-manager.gateway';

import { ValidateAttemptService } from './validate-attempt/validate-attempt.service';
import { DatabaseModule } from './database/database.module';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
    controllers: [GameController, DetectionController, GameConstantsController],
    providers: [GameService, Logger, DetectionService, ValidateAttemptService, String, GameGateway, GameManager, GameConstantsController],
})
export class AppModule {}
