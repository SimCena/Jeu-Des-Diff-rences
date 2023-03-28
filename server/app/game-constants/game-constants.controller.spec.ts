import { Test, TestingModule } from '@nestjs/testing';
import { GameConstantsController } from './game-constants.controller';
import fs from 'fs';

describe('GameConstantsController', () => {
    let controller: GameConstantsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameConstantsController],
        }).compile();

        controller = module.get<GameConstantsController>(GameConstantsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getGameConstants', () => {
        it('should return the game constants', () => {
            jest.spyOn(JSON, 'parse').mockReturnValue('string');
            const spy = jest.spyOn(fs, 'readFileSync').mockImplementation();
            controller.getGameConstants();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('putGameConstants', () => {
        it('should put the game constants on the server', () => {
            jest.spyOn(JSON, 'stringify').mockReturnValue('string');
            const spy = jest.spyOn(fs, 'writeFileSync').mockImplementation();
            controller.putGameConstants({ initialTime: 30, goodGuessTime: 5, hintUsedTime: 5 });
            expect(spy).toHaveBeenCalled();
        });
    });
});
