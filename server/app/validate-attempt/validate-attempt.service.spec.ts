/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TOP_SCORES } from '@app/constants/game';
import { GameService } from '@app/game/game.service';
import { Attempt } from '@common/attempt';
import { IMAGE_WIDTH } from '@common/constants/image';
import { Coordinate } from '@common/coordinate';
import { Difference, Game } from '@common/games';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance, restore } from 'sinon';
import { ValidateAttemptService } from './validate-attempt.service';

describe('ValiderTentativeService', () => {
    let service: ValidateAttemptService;
    let mockGame: Game;
    let mockAttempt: Attempt;
    let gameService: SinonStubbedInstance<GameService>;

    beforeEach(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn<any, any>(GameService.prototype, 'readGames').mockImplementation();
        gameService = createStubInstance<GameService>(GameService);

        const module: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule.forRoot({ isGlobal: false })],
            providers: [ValidateAttemptService, { provide: GameService, useValue: gameService }, ConfigService],
        }).compile();

        mockGame = {
            id: 72,
            name: 'FakeGame',
            url: 'string',
            solo: TOP_SCORES,
            multiplayer: TOP_SCORES,
            differenceImage: [
                {
                    positions: [0, 0],
                    differenceNumber: 0,
                },
            ],
            originalImage: 'http://netghost.narod.ru/gff/sample/images/micbmp/blk.bmp',
            modifiedImage: 'http://netghost.narod.ru/gff/sample/images/micbmp/blk.bmp',
        };
        mockAttempt = {
            coords: {
                x: 0,
                y: 0,
            },
            currentGameId: 1,
        };

        service = module.get<ValidateAttemptService>(ValidateAttemptService);
    });

    afterEach(async () => {
        restore();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('setGameData() should set values to the difference map and to the original and modified images', () => {
        const testMap = new Map();
        testMap.set(0, 0);
        testMap.set(0, 0);
        gameService.getGame.returns(mockGame);
        service.setGameData(1);
        expect(service['differences']).toStrictEqual(testMap);
    });

    it('translatePosition() should return single value from set of coordinates', () => {
        const coords: Coordinate = { x: 4, y: 4 };
        expect(service['translatePosition'](coords)).toStrictEqual(4 + 4 * IMAGE_WIDTH);
    });

    it('isDifferenceFound() should return true if difference already has been found', () => {
        const differencesFound: number[] = [1, 2, 3];
        const differenceNumber = 2;
        expect(service['isDifferenceFound'](differenceNumber, differencesFound)).toBeTruthy();
    });

    it('isDifferenceFound() should return false if difference has not already been found', () => {
        const differencesFound: number[] = [1, 2, 3];
        const differenceNumber = 4;
        expect(service['isDifferenceFound'](differenceNumber, differencesFound)).toBeFalsy();
    });

    it('isDifferenceFound() should return false if no difference has already been found', () => {
        const differencesFound: number[] = [];
        const differenceNumber = 4;
        expect(service['isDifferenceFound'](differenceNumber, differencesFound)).toBeFalsy();
    });

    it('validateAttempt() should return undefined if the difference map is not set', () => {
        expect(service.validateAttempt(mockAttempt, [])).toStrictEqual(undefined);
    });

    it('validateAttempt() should return undefined if the coords are not in the difference map', () => {
        service['differences'].set(1, 1);
        expect(service.validateAttempt(mockAttempt, [])).toStrictEqual(undefined);
    });

    it('validateAttempt() should return undefined if the coords are part of an already discovered difference', () => {
        service['differences'].set(0, 1);
        expect(service.validateAttempt(mockAttempt, [1])).toStrictEqual(undefined);
    });

    it('validateAttempt() should return a Difference object with the positions and the difference number if valid coords are passed', () => {
        gameService.getGame.returns(mockGame);
        service.setGameData(1);
        service['differences'].set(0, 1);
        const expectedData: Difference = {
            positions: [0],
            differenceNumber: 1,
        };
        expect(service.validateAttempt(mockAttempt, [])).toStrictEqual(expectedData);
    });
});
