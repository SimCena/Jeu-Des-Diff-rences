import { GameService } from '@app/game/game.service';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@common/constants/image';
import { Game, GameClient } from '@common/games';
import { GameData, GameDataNumbered } from '@common/game-data';
import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from '@app/database/database-service/database.service';

const games: Game[] = [
    {
        id: 1,
        name: 'test0',
        url: 'test0',
        solo: [],
        multiplayer: [],
        differenceImage: [
            {
                positions: [],
                differenceNumber: 0,
            },
        ],
        originalImage: '',
        modifiedImage: '',
    },
];

const gamesClient: GameClient[] = [
    {
        id: 1,
        name: 'test0',
        url: 'test0',
        solo: [],
        multiplayer: [],
        differenceCount: 1,
    },
];

describe('GameController', () => {
    let controller: GameController;
    let service: GameService;

    beforeEach(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn<any, any>(GameService.prototype, 'readGames').mockImplementation();
        const module: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule.forRoot({ isGlobal: false })],
            providers: [GameService, ConfigService, { provide: DatabaseService, useValue: DatabaseService }],
            controllers: [GameController],
        }).compile();
        controller = module.get<GameController>(GameController);

        service = module.get<GameService>(GameService);
        service['games'] = games;
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('An empty get request should return gamelist from gameService', () => {
        expect(controller.getGames()).toStrictEqual(gamesClient);
    });

    it('A put request should call addGame from gameService', () => {
        const addGameSpy = jest.spyOn(service, 'addGame').mockImplementation();
        const imgData: ImageData = {
            data: new Uint8ClampedArray([0, 0, 0, 0]),
            colorSpace: 'display-p3',
            height: IMAGE_HEIGHT,
            width: IMAGE_WIDTH,
        };
        const game: GameData = {
            gameName: 'test',
            originalImage: imgData,
            modifiedImage: imgData,
            differenceImage: [
                {
                    positions: [],
                    differenceNumber: 0,
                },
            ],
        };
        const gameNumberised: GameDataNumbered = {
            gameName: 'test',
            originalImage: Object.values(game.originalImage.data),
            modifiedImage: Object.values(game.modifiedImage.data),
            differenceImage: [
                {
                    positions: [],
                    differenceNumber: 0,
                },
            ],
        };
        controller.addGame(game);
        expect(addGameSpy).toHaveBeenCalledWith(gameNumberised);
    });

    describe('getDifferencesPositions', () => {
        it('A get request with an id should call getDifferencesPositions from gameService with this id', () => {
            const getDifferencesPositionsSpy = jest.spyOn(service, 'getDifferencesPositions').mockImplementation();
            controller.getDifferencesPositions('1');
            expect(getDifferencesPositionsSpy).toHaveBeenCalledWith(1);
        });
    });
});
