import { Game as GameSchema, gameSchema } from '@app/database/game-schema';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { DatabaseService } from './database.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Game } from '@common/games';
import { TOP_SCORES } from '@app/constants/game';

const CLOSE_DELAY = 200;
const GAME_SCHEMAS = [
    {
        gameId: 1,
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
        originalImage: 'randomPath',
        modifiedImage: 'randomPath',
    },
    {
        gameId: 2,
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
        originalImage: 'randomPath',
        modifiedImage: 'randomPath',
    },
];
const GAMES = [
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
        originalImage: 'randomPath',
        modifiedImage: 'randomPath',
    },
    {
        id: 2,
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
        originalImage: 'randomPath',
        modifiedImage: 'randomPath',
    },
];

describe('DatabaseServiceService', () => {
    let service: DatabaseService;
    let gameModel: Model<GameSchema>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();

        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: GameSchema.name, schema: gameSchema }]),
            ],
            providers: [DatabaseService],
        }).compile();

        service = module.get<DatabaseService>(DatabaseService);
        gameModel = module.get<Model<GameSchema>>(getModelToken(GameSchema.name));
        connection = await module.get(getConnectionToken());
    });

    afterEach((done) => {
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, CLOSE_DELAY);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(gameModel).toBeDefined();
    });

    describe('getGames', () => {
        it('should return all games', async () => {
            await gameModel.deleteMany({});
            expect((await service.getGames()).length).toEqual(0);
            await gameModel.insertMany(GAME_SCHEMAS);
            expect((await service.getGames()).length).toEqual(2);
        });
    });

    describe('addGame', () => {
        it('addGame() should add the game to the DB', async () => {
            await gameModel.deleteMany({});
            await service.addGame(GAMES[0]);
            expect(await gameModel.countDocuments()).toEqual(1);
        });

        it('should reject if query failed', async () => {
            jest.spyOn(gameModel, 'create').mockImplementation(async () => Promise.reject());
            await expect(service.addGame(GAMES[0])).rejects.toEqual('Query Failed');
        });
    });

    describe('removeGame', () => {
        it('should remove the game from the DB', async () => {
            await gameModel.deleteMany({});
            expect(await gameModel.countDocuments()).toEqual(0);
            await gameModel.insertMany(GAME_SCHEMAS);
            const gameId = GAMES[0].id;
            await service.removeGame(gameId);
            expect(await gameModel.find({ gameId })).toEqual([]);
            expect(await gameModel.countDocuments()).toEqual(1);
        });

        it('should reject if query failed', async () => {
            jest.spyOn(gameModel, 'deleteOne').mockRejectedValue('');
            await expect(service.removeGame(0)).rejects.toEqual('Query Failed');
        });

        it('should reject query if game doesnt exist', async () => {
            await gameModel.deleteMany({});
            await gameModel.insertMany(GAME_SCHEMAS);
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            await expect(service.removeGame(-1)).rejects.toEqual('Game Not Found');
        });
    });

    describe('updateGame', () => {
        it('should update the game for valid id', async () => {
            const modifiedGame: Game = {
                id: GAMES[0].id,
                name: 'modifiedName',
                url: GAMES[0].url,
                solo: GAMES[0].solo,
                multiplayer: GAMES[0].multiplayer,
                differenceImage: GAMES[0].differenceImage,
                originalImage: GAMES[0].originalImage,
                modifiedImage: GAMES[0].modifiedImage,
            };
            await gameModel.deleteMany({});
            expect(await gameModel.countDocuments()).toEqual(0);
            await gameModel.insertMany(GAME_SCHEMAS);
            await service.updateGame(modifiedGame);
            const updatedDBGame: GameSchema[] = (await gameModel.find({ gameId: GAMES[0].id }).exec()) as unknown as GameSchema[];
            expect(updatedDBGame[0].name).toBe(modifiedGame.name);
        });

        it('should call convertSchemaToGame', async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const spy = jest.spyOn<any, any>(service, 'convertGameToSchema');
            const modifiedGame: Game = {
                id: GAMES[0].id,
                name: 'modifiedName',
                url: GAMES[0].url,
                solo: GAMES[0].solo,
                multiplayer: GAMES[0].multiplayer,
                differenceImage: GAMES[0].differenceImage,
                originalImage: GAMES[0].originalImage,
                modifiedImage: GAMES[0].modifiedImage,
            };
            await gameModel.deleteMany({});
            expect(await gameModel.countDocuments()).toEqual(0);
            await gameModel.insertMany(GAME_SCHEMAS);
            await service.updateGame(modifiedGame);
            expect(spy).toBeCalledWith(modifiedGame);
        });

        it('should reject if query failed', async () => {
            jest.spyOn(gameModel, 'updateOne').mockRejectedValue('');
            await expect(service.updateGame(GAMES[0])).rejects.toEqual('Query Failed');
        });

        it('should reject query if game doesnt exist', async () => {
            await gameModel.deleteMany({});
            await gameModel.insertMany(GAME_SCHEMAS);
            const oldId = GAMES[0].id;
            GAMES[0].id = -1;
            await expect(service.updateGame(GAMES[0])).rejects.toEqual('Game Not Found');
            GAMES[0].id = oldId;
        });
    });

    describe('removeAllGames', () => {
        it('should remove all games from the DB', async () => {
            await gameModel.deleteMany({});
            await gameModel.insertMany(GAME_SCHEMAS);
            await service.removeAllGames();
            expect(await gameModel.find({})).toEqual([]);
            expect(await gameModel.countDocuments()).toEqual(0);
        });

        it('should reject if query failed', async () => {
            jest.spyOn(gameModel, 'deleteMany').mockRejectedValue('');
            await expect(service.removeAllGames()).rejects.toEqual('Query Failed');
        });
    });

    describe('resetHighscores', () => {
        it('should update all game scores', async () => {
            await gameModel.deleteMany({});
            await gameModel.insertMany(GAME_SCHEMAS);
            await service.resetHighscores();
            (await gameModel.find({})).forEach((game) => {
                expect(game.solo).toEqual(TOP_SCORES);
                expect(game.multiplayer).toEqual(TOP_SCORES);
            });
        });

        it('should reject if query failed', async () => {
            jest.spyOn(gameModel, 'updateMany').mockRejectedValue('');
            await expect(service.resetHighscores()).rejects.toEqual('Query Failed');
        });
    });

    describe('convertGameToSchema', () => {
        it('should convert game to schema', () => {
            expect(service['convertGameToSchema'](GAMES[0])).toEqual(GAME_SCHEMAS[0]);
        });
    });

    describe('convertSchemaToGame', () => {
        it('should convert schema to game', () => {
            expect(service['convertSchemaToGame'](GAME_SCHEMAS[0])).toEqual(GAMES[0]);
        });
    });
});
