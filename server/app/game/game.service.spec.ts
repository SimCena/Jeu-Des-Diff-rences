/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TOP_SCORES } from '@app/constants/game';
import { DatabaseService } from '@app/database/database-service/database.service';
import { GameDataNumbered } from '@common/game-data';
import { Difference, Game, GameClient } from '@common/games';
import { RoomId } from '@common/room-id';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as bmp from 'bmp-js';
import fs from 'fs';
import { GameService } from './game.service';
import { SinonStubbedInstance, createStubInstance, restore } from 'sinon';
import { GameRoom } from '@common/game-room';

jest.mock('bmp-js', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    // @ts-ignore
    ...jest.requireActual('bmp-js'),
}));

describe('GameService', () => {
    let service: GameService;
    let games: Game[];
    let databaseService: SinonStubbedInstance<DatabaseService>;
    let mkdirSyncSpy: jest.SpyInstance<any, any>;

    beforeEach(async () => {
        games = [
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
                originalImage: '',
                modifiedImage: '',
            },
        ];
        databaseService = createStubInstance(DatabaseService, {
            getGames: Promise.resolve(games),
            addGame: Promise.resolve(),
            removeGame: Promise.resolve(),
            updateGame: Promise.resolve(),
            removeAllGames: Promise.resolve(),
            resetHighscores: Promise.resolve(),
        });

        const module: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule.forRoot({ isGlobal: false })],
            providers: [GameService, ConfigService, { provide: DatabaseService, useValue: databaseService }],
        }).compile();

        service = module.get<GameService>(GameService);
        service['games'] = games;
        mkdirSyncSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation();
    });

    afterEach(async () => {
        restore();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('addGame', () => {
        it('should add game to this.games object', async () => {
            jest.spyOn<any, any>(service, 'writeImageToBMPFile').mockImplementation();
            const differenceImage: Difference[] = [
                {
                    positions: [2, 3],
                    differenceNumber: 1,
                },
            ];
            const game: GameDataNumbered = {
                gameName: 'allo',
                differenceImage,
                originalImage: [1, 2, 3, 4],
                modifiedImage: [1, 0, 0, 4],
            };
            const gamesBefore = games.length;

            await service.addGame(game);
            expect(games[gamesBefore].name).toStrictEqual('allo');
        });

        it('should resolve false if the database rejects', async () => {
            const differenceImage: Difference[] = [
                {
                    positions: [2, 3],
                    differenceNumber: 1,
                },
            ];
            const game: GameDataNumbered = {
                gameName: 'allo',
                differenceImage,
                originalImage: [1, 2, 3, 4],
                modifiedImage: [1, 0, 0, 4],
            };
            jest.spyOn(databaseService, 'addGame').mockRejectedValue('');
            await service.addGame(game).then((result: boolean) => {
                expect(result).toBe(false);
            });
        });
    });

    describe('writeImageToBMPFile', () => {
        it('should call convertImageDataToABGRBuffer', () => {
            const spy = jest.spyOn<any, any>(service, 'convertImageDataToABGRBuffer').mockReturnValue(Buffer.from([]));
            jest.spyOn(bmp, 'encode').mockReturnValue({});
            jest.spyOn(fs, 'writeFileSync').mockImplementation();
            service['writeImageToBMPFile']('', []);
            expect(spy).toHaveBeenCalledWith([]);
        });
        it('should create the bmp_images folder if it is not already there', () => {
            jest.spyOn(fs, 'existsSync').mockReturnValue(false);
            jest.spyOn(bmp, 'encode').mockReturnValue({});
            jest.spyOn(fs, 'writeFileSync').mockImplementation();
            jest.spyOn<any, any>(service, 'convertImageDataToABGRBuffer').mockReturnValue(Buffer.from([]));
            service['writeImageToBMPFile']('', []);
            expect(mkdirSyncSpy).toHaveBeenCalledWith('assets/bmp_images/');
        });
    });

    it('swapValues() swap values', () => {
        const array = [1, 2];
        expect(service['swapValues'](0, 1, array)).toStrictEqual([2, 1]);
    });

    it('convertToABGR should take RGBA array and return ABGR format array', () => {
        const data = [0, 2, 3, 4, 0, 2, 3, 4];
        expect(service['convertToABGR'](data)).toStrictEqual([4, 3, 2, 0, 4, 3, 2, 0]);
    });

    it('convertToABGRBuffer should take RGBA array and return ABGR Buffer', () => {
        const data = [0, 2, 3, 4, 0, 2, 3, 4];
        expect(service['convertImageDataToABGRBuffer'](data)).toStrictEqual(Buffer.from([4, 3, 2, 0, 4, 3, 2, 0]));
    });

    it('fixAlphaData() should convert ABGR where A is always 0 data to RGBA where A is always 255', () => {
        const data = [0, 2, 3, 4, 0, 2, 3, 4];
        expect(service['fixAlphaData'](data)).toStrictEqual([4, 3, 2, 255, 4, 3, 2, 255]);
    });

    it('getGameIndex() should return array index when passed game index', () => {
        expect(service['getGamePosition'](1)).toStrictEqual(0);
    });

    it('getGame() should return correct game game index', () => {
        expect(service.getGame(1)).toStrictEqual(games[0]);
    });

    it('getImageData() should call decode, readFileSync and fixAlphaData', () => {
        jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
            return Buffer.from('testBuffer');
        });
        jest.spyOn(bmp, 'decode').mockImplementation(() => {
            return { data: [1, 2, 3] };
        });
        jest.spyOn<any, string>(service, 'fixAlphaData').mockImplementation((data) => {
            return data;
        });
        expect(service.getImageData('mockPath')).toStrictEqual([1, 2, 3]);
    });

    it('getGames should return the games array', () => {
        expect(service.getGames()).toBe(service['games']);
    });

    it('getDifferencesPositions should return the differences positions', () => {
        // eslint-disable-next-line quote-props
        games[0].differenceImage = [
            {
                positions: [2, 3],
                differenceNumber: 1,
            },
        ];
        jest.spyOn(service, 'getGame').mockReturnValue(games[0]);
        expect(service.getDifferencesPositions(2)).toEqual([
            {
                positions: [2, 3],
                differenceNumber: 1,
            },
        ]);
    });

    describe('updateGame', () => {
        it('should call the database service function', () => {
            const spy = jest.spyOn(service['databaseService'], 'updateGame');
            service.updateGame(service['games'][0]);
            expect(spy).toHaveBeenCalledWith(service['games'][0]);
        });

        it('should reject if the database query fails', async () => {
            jest.spyOn(databaseService, 'updateGame').mockRejectedValue('');
            await expect(service.updateGame(service['games'][0])).rejects.toEqual('Query Failed');
        });
    });

    describe('resetGames', () => {
        it('should call the resetHighscores function from database', async () => {
            const spy = jest.spyOn(databaseService, 'resetHighscores');
            await service.resetGames();
            expect(spy).toHaveBeenCalled();
        });

        it('should reset all the game scores', async () => {
            await service.resetGames();
            service['games'].forEach((game) => {
                expect(game.solo).toEqual(TOP_SCORES);
                expect(game.multiplayer).toEqual(TOP_SCORES);
            });
        });

        it('should reject if database query failed', async () => {
            jest.spyOn(databaseService, 'resetHighscores').mockRejectedValue('Query Failed');
            await expect(service.resetGames()).rejects.toEqual('Query Failed');
        });
    });

    describe('resetGame', () => {
        it('should return array index when passed game index', () => {
            service.resetGame(1);
            expect(service.getGame(1).multiplayer).toStrictEqual(TOP_SCORES);
        });

        it('should reject if database query fails', async () => {
            jest.spyOn(databaseService, 'updateGame').mockRejectedValue('Query Failed');
            expect(service.resetGame(1)).rejects.toEqual('Query Failed');
        });
    });

    describe('deleteGame', () => {
        it('should push the deleted game to the temporary deleted games if a game of this type is being played', async () => {
            jest.spyOn(service, 'isGameBeingPlayed').mockReturnValue(true);
            jest.spyOn<any, any>(service, 'getGamePosition').mockReturnValue(0);
            jest.spyOn<any, string>(service, 'deleteImages').mockImplementation();
            service['tempDeletedGames'] = [];
            service.deleteGame(1, [], []).then(() => {
                expect(service['tempDeletedGames'].length).toBe(1);
            });
        });
        it('should delete the images associated to this game if a game of this type is not being played', async () => {
            jest.spyOn(service, 'isGameBeingPlayed').mockReturnValue(false);
            const spy = jest.spyOn<any, string>(service, 'deleteImages').mockImplementation();
            service['tempDeletedGames'] = [];
            await service.deleteGame(1, [], []);
            expect(spy).toHaveBeenCalled();
        });

        it('should resolve false if the database query fails', async () => {
            jest.spyOn(databaseService, 'removeGame').mockRejectedValue('');
            await service.deleteGame(1, [], []).then((result: boolean) => {
                expect(result).toBe(false);
            });
        });
    });

    describe('deleteGames', () => {
        it('should call deleteImages for each deletedGame', async () => {
            jest.spyOn<any, any>(service, 'saveTempGames').mockReturnValue(false);
            const spy = jest.spyOn<any, any>(service, 'deleteImages').mockImplementation();
            await service.deleteGames([], []);
            expect(spy).toHaveBeenCalledTimes(2);
        });

        it('should return a list of all game ids', async () => {
            jest.spyOn<any, any>(service, 'saveTempGames').mockReturnValue(true);
            expect(await service.deleteGames([], [])).toEqual([1, 2]);
        });

        it('should delete all games', async () => {
            jest.spyOn<any, any>(service, 'saveTempGames').mockReturnValue(true);
            await service.deleteGames([], []);
            expect(service['games']).toEqual([]);
        });

        it('should reject if database query failed', async () => {
            jest.spyOn(databaseService, 'removeAllGames').mockRejectedValue('Query Failed');
            await expect(service.deleteGames([], [])).rejects.toEqual('Query Failed');
        });
    });

    describe('getClientGames', () => {
        it('should return games with only info needed by client', () => {
            const gameClients: GameClient[] = [
                {
                    id: 1,
                    name: 'test0',
                    url: 'test0',
                    solo: [],
                    multiplayer: [],
                    differenceCount: 1,
                },
                {
                    id: 2,
                    name: 'test0',
                    url: 'test0',
                    solo: [],
                    multiplayer: [],
                    differenceCount: 1,
                },
            ];
            expect(service.getClientGames()).toEqual(gameClients);
        });
    });

    describe('updateTempDeletedGames', () => {
        it('should remove each game that is not being played', () => {
            jest.spyOn(service, 'isGameBeingPlayed').mockReturnValue(false);
            const spy = jest.spyOn(service, 'deleteTempGame').mockImplementation();
            service['tempDeletedGames'] = games;
            service.updateTempDeletedGames([], []);
            expect(spy).toHaveBeenCalledTimes(2);
        });
    });

    describe('getNextLimitedGame', () => {
        let gameRoom: GameRoom;
        beforeEach(() => {
            gameRoom = {
                roomId: { gameId: 0, roomNumber: 0, stringFormat: '0 0', hostId: 'matcorb' },
                host: { socketId: 'matcorb', name: '', differencesFound: [] },
                guest: { socketId: 'simcena', name: '', differencesFound: [] },
                numberDifferences: 1,
                clock: 0,
                gameStarted: false,
                constants: { initialTime: 30, goodGuessTime: 5, hintUsedTime: 5 },
                isLimitedTime: false,
                gameIds: [],
            };
            service['games'] = games;
        });
        it('should return undefined if there are no games left', () => {
            gameRoom.gameIds = [0, 1];

            expect(service.getNextLimitedGame(gameRoom)).toBe(undefined);
        });
        it('should return another game that was not player before', () => {
            jest.spyOn(Math, 'random').mockImplementation(() => {
                return 0;
            });
            gameRoom.gameIds = [0];

            expect(service.getNextLimitedGame(gameRoom)).toBe(1);
        });
        it('should return another game that was not player before', () => {
            jest.spyOn(Math, 'random').mockImplementation(() => {
                return 0;
            });
            gameRoom.gameIds = [1];

            expect(service.getNextLimitedGame(gameRoom)).toBe(2);
        });
    });

    describe('isGameBeingPlayed', () => {
        it('should return true if there is at least one game being played', () => {
            const roomId: RoomId = {
                gameId: 3,
                roomNumber: 0,
                stringFormat: 'test',
                hostId: 'test',
            };
            expect(service.isGameBeingPlayed(3, [roomId], [])).toBeTruthy();
        });
        it('should return true if there are no games being played', () => {
            const roomId: RoomId = {
                gameId: 3,
                roomNumber: 0,
                stringFormat: 'test',
                hostId: 'test',
            };
            expect(service.isGameBeingPlayed(3, [roomId], [roomId])).toBeFalsy();
        });
    });

    describe('deleteTempGame', () => {
        it('should delete the images associated to the game if a game is deleted', () => {
            jest.spyOn<any, string>(service, 'deleteTempGameFromTempList').mockReturnValue(true);
            const spy = jest.spyOn<any, string>(service, 'deleteImages').mockImplementation();
            service.deleteTempGame(0);
            expect(spy).toHaveBeenCalledWith(0);
        });
    });

    describe('deleteTempGameFromTempList', () => {
        it('should return true if a game has been deleted', () => {
            service['tempDeletedGames'] = service['games'];
            expect(service['deleteTempGameFromTempList'](1)).toBeTruthy();
        });
        it('should return false if no game has been deleted', () => {
            service['tempDeletedGames'] = [];
            expect(service['deleteTempGameFromTempList'](2)).toBeFalsy();
        });
    });

    describe('deleteImages', () => {
        it('should delete the original and modified image', () => {
            const spy = jest.spyOn(fs, 'unlink').mockImplementation((string, callback) => {
                return callback(null);
            });
            service['deleteImages'](0);
            expect(spy).toHaveBeenCalledTimes(2);
        });
    });

    describe('getIdCountInArray', () => {
        it('should return the count of ids in an array of rooms', () => {
            const roomOne: RoomId = {
                gameId: 1,
                roomNumber: 0,
                stringFormat: 'test',
                hostId: 'test',
            };
            const roomTwo: RoomId = {
                gameId: 2,
                roomNumber: 0,
                stringFormat: 'test',
                hostId: 'test',
            };
            expect(service['getIdCountInArray'](1, [roomOne, roomOne, roomTwo])).toBe(2);
        });
    });

    describe('getLowestAvailableId', () => {
        it('should return the lowest available id', () => {
            service['tempDeletedGames'] = [
                {
                    id: 0,
                    name: 'test0',
                    url: 'test0',
                    solo: [],
                    multiplayer: [],
                    differenceImage: [
                        {
                            positions: [2, 3],
                            differenceNumber: 1,
                        },
                    ],
                    originalImage: '',
                    modifiedImage: '',
                },
            ];
            expect(service['getLowestAvailableId']()).toBe(3);
        });
    });

    describe('writeImageToBMPFile', () => {
        it('should call convertImageDataToABGRBuffer', () => {
            jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
                return;
            });
            const spy = jest.spyOn<any, any>(service, 'convertImageDataToABGRBuffer');

            service['writeImageToBMPFile']('test.path', [0, 1, 2, 3]);
            expect(spy).toHaveBeenCalledWith([3, 2, 1, 0]);
        });
        it('should call writeFileSync with the right data', () => {
            jest.spyOn<any, any>(bmp, 'encode').mockImplementation(() => {
                return {
                    data: '[0, 1, 2]',
                };
            });
            const spy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
                return;
            });

            service['writeImageToBMPFile']('test.path', [0, 1, 2, 3]);
            expect(spy).toHaveBeenCalledWith('test.path', '[0, 1, 2]');
        });
    });
});
