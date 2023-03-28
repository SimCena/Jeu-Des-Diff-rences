/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { GameConstantsController } from '@app/game-constants/game-constants.controller';
import { GameService } from '@app/game/game.service';
import { Authors } from '@common/chat';
import { GameRoom } from '@common/game-room';
import { Game } from '@common/games';
import { PlayerRanking } from '@common/player-ranking';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, restore } from 'sinon';
import { GameManager } from './game-manager.service';

const mockGame: Game = {
    id: 1,
    name: 'test0',
    url: 'test0',
    solo: [
        {
            name: 'test1',
            time: 300,
        },
        {
            name: 'test2',
            time: 600,
        },
        {
            name: 'test3',
            time: 900,
        },
    ],
    multiplayer: [
        {
            name: 'test1',
            time: 300,
        },
        {
            name: 'test2',
            time: 600,
        },
        {
            name: 'test3',
            time: 900,
        },
    ],
    differenceImage: [
        {
            positions: [],
            differenceNumber: 0,
        },
    ],
    originalImage: '',
    modifiedImage: '',
};

const mockGameRoom: GameRoom = {
    roomId: {
        gameId: 0,
        roomNumber: 0,
        stringFormat: 'test',
        hostId: 'simon',
    },
    host: {
        socketId: 'simon',
        name: 'simon',
        differencesFound: [0, 1, 2],
    },
    guest: {
        socketId: 'cedric',
        name: 'cedric',
        differencesFound: [3, 4],
    },
    numberDifferences: 5,
    clock: 120,
    gameStarted: false,
    constants: {
        initialTime: 30,
        goodGuessTime: 5,
        hintUsedTime: 5,
    },
    isLimitedTime: false,
    gameIds: [],
};

const mockGameRoom2: GameRoom = {
    roomId: {
        gameId: 0,
        roomNumber: 0,
        stringFormat: 'test',
        hostId: 'simon',
    },
    host: {
        socketId: 'simon',
        name: 'simon',
        differencesFound: [0, 1, 2],
    },
    guest: {
        socketId: 'cedric',
        name: 'cedric',
        differencesFound: [3, 4],
    },
    numberDifferences: 5,
    clock: 1000,
    gameStarted: false,
    constants: {
        initialTime: 30,
        goodGuessTime: 5,
        hintUsedTime: 5,
    },
    isLimitedTime: false,
    gameIds: [],
};

describe('GameManager', () => {
    let service: GameManager;
    let mockSoloGameRoom: GameRoom;
    let mockMultiGameRoom: GameRoom;
    let mockGameConstantsController: GameConstantsController;
    let mockGameService: GameService;

    beforeEach(async () => {
        mockGameConstantsController = createStubInstance<GameConstantsController>(GameConstantsController);
        mockGameService = createStubInstance<GameService>(GameService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [GameManager, GameConstantsController, { provide: GameService, useValue: mockGameService }],
        }).compile();

        jest.spyOn(mockGameConstantsController, 'getGameConstants').mockImplementation(() => {
            return { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 };
        });

        mockSoloGameRoom = {
            roomId: { gameId: 0, roomNumber: 0, stringFormat: '0 0', hostId: 'matcorb' },
            host: { socketId: 'matcorb', name: '', differencesFound: [] },
            guest: { socketId: '', name: '', differencesFound: [] },
            numberDifferences: 1,
            clock: 0,
            gameStarted: false,
            constants: { initialTime: 30, goodGuessTime: 5, hintUsedTime: 5 },
            isLimitedTime: false,
            gameIds: [],
        };
        mockMultiGameRoom = {
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
        service = module.get<GameManager>(GameManager);
    });

    afterEach(async () => {
        restore();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getGameRooms should return an array of game rooms', () => {
        service['gameRooms'] = [mockSoloGameRoom];
        expect(service.getGameRooms()).toStrictEqual([mockSoloGameRoom]);
    });

    it('findGameRoom should return undefined if the id is not in any game room in gameRooms', () => {
        expect(service.findGameRoom(mockMultiGameRoom.host.socketId)).toBeUndefined();
    });

    it('findGameRoom should return the correct game room if the room id corresponds to a gameRoom in gameRooms', () => {
        service['gameRooms'] = [mockMultiGameRoom];
        expect(service.findGameRoom(mockMultiGameRoom.roomId.stringFormat)).toStrictEqual(mockMultiGameRoom);
    });

    it('findGameRoom should return the correct game room if the host id corresponds to a gameRoom in gameRooms', () => {
        service['gameRooms'] = [mockMultiGameRoom];
        expect(service.findGameRoom(mockMultiGameRoom.host.socketId)).toStrictEqual(mockMultiGameRoom);
    });

    it('findGameRoom should return the correct game room if the guest id corresponds to a gameRoom in gameRooms', () => {
        service['gameRooms'] = [mockMultiGameRoom];
        expect(service.findGameRoom(mockMultiGameRoom.guest.socketId)).toStrictEqual(mockMultiGameRoom);
    });

    it('findPlayerName should return the host name if the host id is passed', () => {
        expect(service.findPlayerName(mockMultiGameRoom.host.socketId, mockMultiGameRoom)).toStrictEqual(mockMultiGameRoom.host.name);
    });

    it('findPlayerName should return the guest name if the guest id is passed', () => {
        expect(service.findPlayerName(mockMultiGameRoom.guest.socketId, mockMultiGameRoom)).toStrictEqual(mockMultiGameRoom.guest.name);
    });

    it('findOpponent should return the guest if the host id is passed', () => {
        expect(service.findOpponent(mockMultiGameRoom.host.socketId, mockMultiGameRoom)).toStrictEqual(mockMultiGameRoom.guest);
    });

    it('findOpponent should return the host if the guest id is passed', () => {
        expect(service.findOpponent(mockMultiGameRoom.guest.socketId, mockMultiGameRoom)).toStrictEqual(mockMultiGameRoom.host);
    });

    it('createGame should create a game room and add it to gameRooms if gameRooms is empty', () => {
        service.createGame(mockSoloGameRoom.roomId, 1, false);
        expect(service['gameRooms']).toStrictEqual([mockSoloGameRoom]);
    });

    it('createGame should create a game room and add it to gameRooms if gameRooms is not empty', () => {
        service['gameRooms'] = [mockMultiGameRoom];
        service.createGame(mockSoloGameRoom.roomId, 1, false);
        expect(service['gameRooms']).toStrictEqual([mockMultiGameRoom, mockSoloGameRoom]);
    });

    it('addGuest should add the guest socket id to the correct game room', () => {
        service.addGuest(mockSoloGameRoom, mockMultiGameRoom.guest.socketId);
        expect(mockSoloGameRoom).toStrictEqual(mockMultiGameRoom);
    });

    it('addPlayerName should add a player name to the host if the socket id is the hosts', () => {
        service.addPlayerName(mockMultiGameRoom, mockMultiGameRoom.host.socketId, 'matcorb');
        expect(mockMultiGameRoom.host.name).toStrictEqual('matcorb');
    });

    it('addPlayerName should add a player name to the host if the socket id is the hosts', () => {
        mockSoloGameRoom.roomId.stringFormat = 'matcorb';
        service.addPlayerName(mockSoloGameRoom, mockSoloGameRoom.roomId.hostId, 'matcorb');
        expect(mockSoloGameRoom.host.name).toStrictEqual('matcorb');
    });

    it('addPlayerName should add a player name to the guest if the socket id is the guests', () => {
        service.addPlayerName(mockMultiGameRoom, mockMultiGameRoom.guest.socketId, 'simcena');
        expect(mockMultiGameRoom.guest.name).toStrictEqual('simcena');
    });

    it('updateDifferencesFound should add the difference number to the host differences found if the host socket id is passed', () => {
        service.updateDifferencesFound(mockMultiGameRoom, mockMultiGameRoom.host.socketId, 0);
        expect(mockMultiGameRoom.host.differencesFound).toStrictEqual([0]);
    });

    it('updateDifferencesFound should add the difference number to the guest differences found if the guest socket id is passed', () => {
        service.updateDifferencesFound(mockMultiGameRoom, mockMultiGameRoom.guest.socketId, 0);
        expect(mockMultiGameRoom.guest.differencesFound).toStrictEqual([0]);
    });

    it('checkForSoloWin should return false if host has not found all the differences', () => {
        expect(service.checkForSoloWin(mockSoloGameRoom)).toBeFalsy();
    });

    it('checkForSoloWin should return true if host has found all the differences', () => {
        mockSoloGameRoom.host.differencesFound = [0];
        expect(service.checkForSoloWin(mockSoloGameRoom)).toBeTruthy();
    });

    it('checkForClassicWin should return undefined if neither the host or the guest have found more than half of the differences', () => {
        expect(service.checkForClassicWin(mockMultiGameRoom)).toBeUndefined();
    });

    it('checkForClassicWin should return the host name if the host has found more than half of the differences', () => {
        mockMultiGameRoom.host.differencesFound = [0];
        expect(service.checkForClassicWin(mockMultiGameRoom)).toStrictEqual(mockMultiGameRoom.host.name);
    });

    it('checkForClassicWin should return the guest name if the guest has found more than half of the differences', () => {
        mockMultiGameRoom.guest.differencesFound = [0];
        expect(service.checkForClassicWin(mockMultiGameRoom)).toStrictEqual(mockMultiGameRoom.guest.name);
    });

    it('checkForClassicTie should return false if the host and guest combined have not found all the differences', () => {
        expect(service.checkForClassicTie(mockMultiGameRoom)).toBeFalsy();
    });

    it('checkForClassicTie should return true if the host and guest combined have found all the differences', () => {
        mockMultiGameRoom.numberDifferences = 2;
        mockMultiGameRoom.host.differencesFound = [0];
        mockMultiGameRoom.guest.differencesFound = [1];
        expect(service.checkForClassicTie(mockMultiGameRoom)).toBeTruthy();
    });

    it('removeGame should not remove a game from gameRooms if the id passed is not in a current game room', () => {
        service['gameRooms'] = [mockMultiGameRoom];
        service.removeGame('0 1');
        expect(service['gameRooms']).toStrictEqual([mockMultiGameRoom]);
    });

    it('removeGame should remove a game from gameRooms if the room id passed is in a current game room', () => {
        service['gameRooms'] = [mockMultiGameRoom];
        service.removeGame('0 0');
        expect(service['gameRooms']).toStrictEqual([]);
    });

    it('removeGame should remove a game from gameRooms if the socket id passed is the hosts', () => {
        service['gameRooms'] = [mockMultiGameRoom];
        service.removeGame('matcorb');
        expect(service['gameRooms']).toStrictEqual([]);
    });

    it('removeGame should remove a game from gameRooms if the socket id passed is the guests', () => {
        service['gameRooms'] = [mockMultiGameRoom];
        service.removeGame('simcena');
        expect(service['gameRooms']).toStrictEqual([]);
    });

    it('removeGame should only remove the game with the corresponding id from gameRooms', () => {
        service['gameRooms'] = [mockMultiGameRoom, mockSoloGameRoom];
        service.removeGame('simcena');
        expect(service['gameRooms']).toStrictEqual([mockSoloGameRoom]);
    });

    describe('clueUsed', () => {
        it('clueUsed should increment clock for classic games', () => {
            service.clueUsed(mockSoloGameRoom);
            expect(mockSoloGameRoom.clock).toStrictEqual(mockSoloGameRoom.constants.hintUsedTime);
        });
        it('should updateTime if isLimitedTime is true on gameRoom', () => {
            const spy = jest.spyOn(service, 'updateTime');
            mockSoloGameRoom.isLimitedTime = true;

            service.clueUsed(mockSoloGameRoom);
            expect(spy).toHaveBeenCalledWith(mockSoloGameRoom, -5);
        });
    });

    describe('differenceFound', () => {
        it('should call updateTime', () => {
            const spy = jest.spyOn(service, 'updateTime');

            service.differenceFound(mockSoloGameRoom);
            expect(spy).toHaveBeenCalledWith(mockSoloGameRoom, 5);
        });
    });

    describe('setGameMode', () => {
        it('should set isLimitedTime on gameRoom', () => {
            service.setGameMode(mockSoloGameRoom, true);
            expect(mockSoloGameRoom.isLimitedTime).toBeTruthy();
        });
        it('should set gameRoom clock to its initialTime if limitedTime is true', () => {
            service.setGameMode(mockSoloGameRoom, true);
            expect(mockSoloGameRoom.clock).toBe(mockSoloGameRoom.constants.initialTime);
        });
        it('should not set the clock to initialTime if not limitedTime', () => {
            service.setGameMode(mockSoloGameRoom, false);
            expect(mockSoloGameRoom.clock).not.toBe(mockSoloGameRoom.constants.initialTime);
        });
    });

    describe('updateTime', () => {
        it('should add the specified number to the clock', () => {
            service.updateTime(mockSoloGameRoom, 11);
            expect(mockSoloGameRoom.clock).toBe(11);
        });
        it('should reset the clock at 120 seconds if isLimitedTime is true and clock is more than 120 seconds', () => {
            mockSoloGameRoom.isLimitedTime = true;
            service.updateTime(mockSoloGameRoom, 121);
            expect(mockSoloGameRoom.clock).toBe(120);
        });
    });

    describe('goToNextGame', () => {
        it('should change the gameId of the room in the gameRoom', () => {
            service.goToNextGame(mockSoloGameRoom, 10);
            expect(mockSoloGameRoom.roomId.gameId).toBe(10);
        });
        it('should add the new gameId in the gameIds of the room', () => {
            service.goToNextGame(mockSoloGameRoom, 10);
            expect(mockSoloGameRoom.gameIds).toEqual([10]);
        });
    });

    describe('checkForLimitedGameEnd', () => {
        it('should return true if gameRoom is time limited and clock is at 0 or less', () => {
            mockSoloGameRoom.isLimitedTime = true;
            mockSoloGameRoom.clock = -1;

            expect(service.checkForLimitedGameEnd(mockSoloGameRoom)).toBeTruthy();
        });
        it('should return false if gameRoom is not time limited', () => {
            mockSoloGameRoom.isLimitedTime = false;

            expect(service.checkForLimitedGameEnd(mockSoloGameRoom)).toBeFalsy();
        });
        it('should return false if gameRoom clock is at 0 or less', () => {
            mockSoloGameRoom.clock = -1;

            expect(service.checkForLimitedGameEnd(mockSoloGameRoom)).toBeFalsy();
        });
    });

    describe('getWinnerRanking', () => {
        beforeEach(() => {
            jest.spyOn<any, any>(service['gameService'], 'getGame').mockReturnValue(mockGame);
        });
        it('should return the right ranking', async () => {
            jest.spyOn<any, any>(service['gameService'], 'updateGame').mockResolvedValue(true);
            jest.spyOn(service, 'findGameRoom').mockReturnValue(mockGameRoom);
            expect(await service.getWinnerRanking('test')).toEqual(PlayerRanking.First);
        });
        it('should return the right ranking', async () => {
            jest.spyOn<any, any>(service['gameService'], 'updateGame').mockResolvedValue(true);
            jest.spyOn(service, 'findGameRoom').mockReturnValue(mockGameRoom2);
            expect(await service.getWinnerRanking('test')).toEqual(PlayerRanking.None);
        });
        it('should return the right ranking', async () => {
            jest.spyOn<any, any>(service['gameService'], 'updateGame').mockResolvedValue(true);
            jest.spyOn(service, 'findGameRoom').mockReturnValue(mockGameRoom);
            expect(await service.getWinnerRanking('test2')).toEqual(PlayerRanking.First);
        });
        it('should resolve PlayerRanking.NotRecorded if gameManager update fails', async () => {
            jest.spyOn<any, any>(service['gameService'], 'updateGame').mockRejectedValue('');
            jest.spyOn(service, 'findGameRoom').mockReturnValue(mockGameRoom);
            expect(await service.getWinnerRanking('test')).toEqual(PlayerRanking.NotRecorded);
        });
    });

    describe('getNewHighScoreMessage', () => {
        it('should return the right high score message for a solo game', () => {
            const mockDate: Date = new Date();
            jest.spyOn(service, 'findGameRoom').mockReturnValue(mockGameRoom);
            jest.spyOn(service['gameService'], 'getGame').mockReturnValue(mockGame);
            jest.spyOn<any, any>(service, 'getCurrentTime').mockReturnValue(mockDate);
            expect(service.getNewHighScoreMessage('1', true, PlayerRanking.First)).toEqual({
                time: mockDate,
                author: Authors.System,
                socketId: undefined,
                body: 'test1 obtient la 1ère place dans les meilleurs temps du jeu « test0 » en solo',
            });
        });
        it('should return the right high score message for a multiplayer game', () => {
            const mockDate: Date = new Date();
            jest.spyOn(service, 'findGameRoom').mockReturnValue(mockGameRoom);
            jest.spyOn(service['gameService'], 'getGame').mockReturnValue(mockGame);
            jest.spyOn<any, any>(service, 'getCurrentTime').mockReturnValue(mockDate);
            expect(service.getNewHighScoreMessage('1', false, PlayerRanking.First)).toEqual({
                time: mockDate,
                author: Authors.System,
                socketId: undefined,
                body: 'test1 obtient la 1ère place dans les meilleurs temps du jeu « test0 » en un contre un',
            });
        });
    });

    describe('getCurrentTime', () => {
        it('should return the formatted current time', () => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date(2020, 3, 1, 8, 8, 8));
            expect(service['getCurrentTime']()).toEqual('08:08:08');
            jest.useRealTimers();
        });
    });

    describe('getClockTime', () => {
        it('should return the clock time', () => {
            service['gameRooms'] = [mockGameRoom];
            expect(service.getClockTime(mockGameRoom.host.socketId)).toBe(mockGameRoom.clock);
        });
    });
});
