/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines */
import { BroadcastOperator } from '@app/../node_modules/socket.io/dist/broadcast-operator';
import { DELAY_BEFORE_EMITTING_TIME } from '@app/constants/socket-manager';
import { GameManager } from '@app/game-manager/game-manager.service';
import { GameService } from '@app/game/game.service';
import { GameGateway } from '@app/gateways/socket-manager.gateway';
import { GameEvents } from '@common/game-events';
import { ValidateAttemptService } from '@app/validate-attempt/validate-attempt.service';
import { Attempt } from '@common/attempt';
import { Authors, Chat, SystemMessage } from '@common/chat';
import { GameRoom } from '@common/game-room';
import { Difference, Game } from '@common/games';
import { Player } from '@common/player';
import { PlayerRanking } from '@common/player-ranking';
import { RoomId } from '@common/room-id';
import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, match, SinonStubbedInstance, restore } from 'sinon';
import { Server, Socket } from 'socket.io';

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

describe('GameGateway', () => {
    let gateway: GameGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let gameService: SinonStubbedInstance<GameService>;
    let validateAttemptService: SinonStubbedInstance<ValidateAttemptService>;
    let gameManager: SinonStubbedInstance<GameManager>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        gameService = createStubInstance<GameService>(GameService);
        validateAttemptService = createStubInstance<ValidateAttemptService>(ValidateAttemptService);
        gameManager = createStubInstance<GameManager>(GameManager);
        const module: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule.forRoot({ isGlobal: false })],
            providers: [
                GameGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: ValidateAttemptService,
                    useValue: validateAttemptService,
                },
                {
                    provide: GameService,
                    useValue: gameService,
                },
                {
                    provide: GameManager,
                    useValue: gameManager,
                },
                ConfigService,
            ],
        }).compile();

        gateway = module.get<GameGateway>(GameGateway);
        gateway['server'] = server;
    });

    afterEach(async () => {
        restore();
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('setValidationData should call setGameData from validateAttemptService', () => {
        const setGameDataSpy = jest.spyOn(validateAttemptService, 'setGameData').mockImplementation(() => {
            let game: Game;
            return game;
        });
        gateway.setValidationData(socket, 1);
        expect(setGameDataSpy).toHaveBeenCalled();
    });

    describe('validateAttempt', () => {
        it('should call validateLimitedGameAttempt if game is limited', () => {
            const attempt: Attempt = {
                currentGameId: 0,
                coords: undefined,
            };
            const player: Player = { socketId: '', name: '', differencesFound: [] };
            const gameRoom: GameRoom = {
                roomId: undefined,
                host: player,
                guest: player,
                numberDifferences: 0,
                clock: 0,
                gameStarted: true,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: true,
                gameIds: [],
            };
            const difference: Difference = {
                differenceNumber: 0,
                positions: [1, 2, 3],
            };
            jest.spyOn(gameManager, 'findGameRoom').mockImplementation(() => {
                return gameRoom;
            });
            jest.spyOn(validateAttemptService, 'validateAttempt').mockImplementation(() => {
                return difference;
            });
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon', '0 0']));
            const spy = jest.spyOn<any, any>(gateway, 'validateLimitedGameAttempt').mockImplementation(() => {
                return;
            });

            gateway.validateAttempt(socket, attempt);
            expect(spy).toHaveBeenCalledWith(socket, gameRoom, difference);
        });
        it('should call setGameData from validateAttemptService', () => {
            const setGameDataSpy = jest.spyOn(validateAttemptService, 'setGameData').mockImplementation(() => {
                let game: Game;
                return game;
            });
            const attempt: Attempt = {
                currentGameId: 0,
                coords: undefined,
            };
            const player: Player = { socketId: '', name: '', differencesFound: [] };
            jest.spyOn(gameManager, 'findGameRoom').mockImplementation(() => {
                return {
                    roomId: undefined,
                    host: player,
                    guest: player,
                    numberDifferences: 0,
                    clock: 0,
                    gameStarted: true,
                    constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                    isLimitedTime: false,
                    gameIds: [],
                };
            });
            jest.spyOn(validateAttemptService, 'validateAttempt').mockImplementation(() => {
                const difference: Difference = {
                    differenceNumber: 0,
                    positions: [1, 2, 3],
                };
                return difference;
            });
            jest.spyOn<any, string>(gateway, 'multiplayerValidAttempt').mockImplementation(() => {
                return;
            });
            jest.spyOn(server, 'to').mockReturnThis();
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon', '0 0']));
            gateway.validateAttempt(socket, attempt);
            expect(setGameDataSpy).toHaveBeenCalled();
        });

        it('should call validateAttempt from validateAttemptService', () => {
            const attempt: Attempt = {
                currentGameId: 0,
                coords: undefined,
            };
            jest.spyOn(validateAttemptService, 'setGameData').mockImplementation(() => {
                let game: Game;
                return game;
            });
            const player: Player = { socketId: '', name: '', differencesFound: [] };
            jest.spyOn(gameManager, 'findGameRoom').mockImplementation(() => {
                return {
                    roomId: undefined,
                    host: player,
                    guest: player,
                    numberDifferences: 0,
                    clock: 0,
                    gameStarted: true,
                    constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                    isLimitedTime: false,
                    gameIds: [],
                };
            });
            const validateAttemptSpy = jest.spyOn(validateAttemptService, 'validateAttempt').mockImplementation(() => {
                let difference: Difference;
                return difference;
            });
            jest.spyOn<any, string>(gateway, 'sendErrorMessage').mockImplementation(() => {
                return;
            });
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon']));
            gateway.validateAttempt(socket, attempt);
            expect(validateAttemptSpy).toHaveBeenCalled();
        });

        it('should send back difference returned from validateAttempt in validateAttemptService', () => {
            const attempt: Attempt = {
                currentGameId: 0,
                coords: undefined,
            };
            let difference: Difference;
            jest.spyOn(validateAttemptService, 'setGameData').mockImplementation(() => {
                let game: Game;
                return game;
            });
            jest.spyOn(validateAttemptService, 'validateAttempt').mockImplementation(() => {
                return difference;
            });
            const player: Player = { socketId: '', name: '', differencesFound: [] };
            jest.spyOn(gameManager, 'findGameRoom').mockImplementation(() => {
                return {
                    roomId: undefined,
                    host: player,
                    guest: player,
                    numberDifferences: 0,
                    clock: 0,
                    gameStarted: true,
                    constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                    isLimitedTime: false,
                    gameIds: [0],
                };
            });
            jest.spyOn<any, string>(gateway, 'sendErrorMessage').mockImplementation(() => {
                return;
            });
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon']));
            gateway.validateAttempt(socket, attempt);
            expect(socket.emit.calledWith(GameEvents.Validation, { difference, playerId: socket.id })).toBeTruthy();
        });

        it('should call soloValidAttempt if attempt is valid and game is solo', () => {
            const attempt: Attempt = {
                currentGameId: 0,
                coords: undefined,
            };
            const difference: Difference = {
                differenceNumber: 0,
                positions: [1, 2, 3],
            };
            jest.spyOn(validateAttemptService, 'setGameData').mockImplementation(() => {
                let game: Game;
                return game;
            });
            jest.spyOn(validateAttemptService, 'validateAttempt').mockImplementation(() => {
                return difference;
            });
            const player: Player = { socketId: '', name: '', differencesFound: [] };
            jest.spyOn(gameManager, 'findGameRoom').mockImplementation(() => {
                return {
                    roomId: undefined,
                    host: player,
                    guest: player,
                    numberDifferences: 0,
                    clock: 0,
                    gameStarted: true,
                    constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                    isLimitedTime: false,
                    gameIds: [],
                };
            });
            const spy = jest.spyOn<any, string>(gateway, 'soloValidAttempt').mockImplementation(() => {
                return;
            });
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon']));
            gateway.validateAttempt(socket, attempt);
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('setImages', () => {
        it('setImages should send back images from the gameService', () => {
            const gameId = 0;
            const image: number[] = [1, 2, 3];
            const game: Game = {
                originalImage: 'test',
                modifiedImage: 'test',
                id: 0,
                name: '',
                url: '',
                solo: [],
                multiplayer: [],
                differenceImage: undefined,
            };

            jest.spyOn(gameService, 'getGame').mockImplementation(() => {
                return game;
            });
            jest.spyOn(gameService, 'getImageData').mockImplementation(() => {
                return image;
            });
            gateway.setImages(socket, gameId);
            expect(socket.emit.calledWith(GameEvents.Images, { original: image, modified: image, differenceNumber: 0 })).toBeTruthy();
        });
    });

    it('afterInit() should emit time after 1s', () => {
        const player: Player = { socketId: '', name: '', differencesFound: [] };
        jest.spyOn(gameManager, 'getGameRooms').mockImplementation(() => {
            return [
                {
                    roomId: { gameId: 0, roomNumber: 0, stringFormat: '0 0', hostId: '0 0' },
                    host: player,
                    guest: player,
                    numberDifferences: 0,
                    clock: 0,
                    gameStarted: true,
                    constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                    isLimitedTime: false,
                    gameIds: [0],
                },
            ];
        });
        const spy = jest.spyOn(server, 'to').mockReturnThis();
        jest.useFakeTimers();
        gateway.afterInit();
        jest.advanceTimersByTime(DELAY_BEFORE_EMITTING_TIME);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('hello message should be sent on connection', () => {
        gateway.handleConnection(socket);
        expect(socket.emit.calledWith(GameEvents.Hello, match.any)).toBeTruthy();
    });

    describe('getActiveRooms', () => {
        it('should emit pendingGames with good Event', () => {
            const room: RoomId = {
                hostId: 'simon',
                gameId: 2,
                roomNumber: 0,
                stringFormat: '2 0',
            };
            gateway['pendingGames'] = [room, room, room];
            const spy = jest.spyOn(socket, 'emit');
            gateway.getActiveRooms(socket);
            expect(spy).toHaveBeenCalledWith(GameEvents.UpdatedPendingRooms, [room, room, room]);
        });
    });

    describe('sendMessage', () => {
        it('should emit message to gameRoom if its in one', () => {
            const message: Chat = {
                author: 'Simon',
                socketId: '',
                body: 'Salut',
            };
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon', '2 0']));
            const testGameRoom: GameRoom = {
                roomId: {
                    stringFormat: 'simon',
                    roomNumber: 0,
                    gameId: 0,
                    hostId: 'simon',
                },
                host: { socketId: '', name: '', differencesFound: [] },
                guest: { socketId: '', name: '', differencesFound: [] },
                numberDifferences: 0,
                clock: 0,
                gameStarted: true,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: true,
                gameIds: [],
            };
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(testGameRoom);
            const spy = jest.spyOn(server, 'to').mockReturnThis();
            gateway.sendMessage(socket, message);
            expect(spy).toHaveBeenCalledWith('simon');
        });
    });

    describe('sendNameWaitingList', () => {
        it('should emit to hostID', () => {
            const room: RoomId = {
                hostId: 'simon',
                gameId: 2,
                roomNumber: 0,
                stringFormat: '2 0',
            };
            gateway['pendingGames'] = [room];
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['pasSimon', '2 0']));
            const spy = jest.spyOn(server, 'to').mockReturnThis();
            gateway.sendNameWaitingList(socket, 'pasSimonNom');
            expect(spy).toHaveBeenCalledWith('simon');
        });
        it('should emit name of person in waiting room ', () => {
            const room: RoomId = {
                hostId: 'simon',
                gameId: 2,
                roomNumber: 0,
                stringFormat: '2 0',
            };
            gateway['pendingGames'] = [room];
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['pasSimon', '2 0']));
            jest.spyOn(server, 'to').mockReturnThis();
            const spy = jest.spyOn(server.to('simon'), 'emit');
            Object.assign(socket, { id: 'pasSimon' });
            gateway.sendNameWaitingList(socket, 'pasSimonNom');
            expect(spy).toHaveBeenCalledWith(GameEvents.AddedNameHostList, {
                name: 'pasSimonNom',
                socketId: 'pasSimon',
            });
        });
    });

    describe('rejectPlayer', () => {
        it('should emit to rejectedSocketID', () => {
            const spy = jest.spyOn(server, 'to').mockReturnThis();
            jest.spyOn(server.to('simon'), 'emit');
            gateway.rejectPlayer(socket, 'simon');
            expect(spy).toHaveBeenCalledWith('simon');
        });
        it('should emit "" waiting room to rejectedSocketID', () => {
            jest.spyOn(server, 'to').mockReturnThis();
            const spy = jest.spyOn(server.to('simon'), 'emit');
            gateway.rejectPlayer(socket, 'simon');
            expect(spy).toHaveBeenCalledWith(GameEvents.PlayerDecision, '');
        });
    });

    describe('acceptPlayer', () => {
        it('should emit to room', () => {
            const spy = jest.spyOn(server, 'to').mockReturnThis();
            jest.spyOn(server.to('simon'), 'emit');
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['pasSimon', '2 0']));
            gateway.acceptPlayer(socket, 'simon');
            expect(spy).toHaveBeenCalledWith('2 0');
        });
        it('should emit acceptedId with right event', () => {
            jest.spyOn(server, 'to').mockReturnThis();
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['pasSimon', '2 0']));
            const spy = jest.spyOn(server.to('pasSimon'), 'emit');
            gateway.acceptPlayer(socket, 'pasSimon');
            expect(spy).toHaveBeenCalledWith(GameEvents.PlayerDecision, 'pasSimon');
        });
        it('should emit to select roomClosed name', () => {
            const room: RoomId = {
                hostId: 'simon',
                gameId: 2,
                roomNumber: 0,
                stringFormat: '2 0',
            };
            gateway['pendingGames'] = [room];
            const toSpy = jest.spyOn(server, 'to').mockReturnThis();
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['pasSimon', '2 0']));
            const spy = jest.spyOn(server.to('select'), 'emit');
            gateway.acceptPlayer(socket, 'pasSimon');
            expect(toSpy).toHaveBeenCalledWith('select');
            expect(spy).toHaveBeenCalledWith(GameEvents.RoomClosed, '2 0');
        });
        it('should remove room from pendingRooms', () => {
            const room: RoomId = {
                hostId: 'simon',
                gameId: 2,
                roomNumber: 0,
                stringFormat: '2 0',
            };
            gateway['pendingGames'] = [room];
            jest.spyOn(server, 'to').mockReturnThis();
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['pasSimon', '2 0']));
            jest.spyOn(server.to('select'), 'emit');
            gateway.acceptPlayer(socket, 'pasSimon');
            expect(gateway['pendingGames']).toEqual([]);
        });
    });

    describe('joinRoom', () => {
        it('should emit to rejectedSocketID', () => {
            const spy = jest.spyOn(socket, 'join');
            gateway.joinRoom(socket, '2 0');
            expect(spy).toHaveBeenCalledWith('2 0');
        });
    });

    describe('joinLimitedRoom', () => {
        let testRoomId: RoomId;
        let testGameRoom: GameRoom;

        beforeEach(() => {
            testRoomId = {
                gameId: 0,
                roomNumber: 0,
                stringFormat: 'limited' + ' ' + socket.id,
                hostId: socket.id,
            };

            const player: Player = { socketId: '', name: '', differencesFound: [] };
            testGameRoom = {
                roomId: undefined,
                host: player,
                guest: player,
                numberDifferences: 0,
                clock: 0,
                gameStarted: true,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: true,
                gameIds: [],
            };

            jest.spyOn(server, 'to').mockReturnThis();
        });
        it('should set pendingLimitedGame to string format with the socketId', () => {
            gateway.joinLimitedRoom(socket, 'testName');
            expect(gateway['pendingLimitedGame']).toBe('limited ' + socket.id);
        });
        it('should push a new roomId to the rooms', () => {
            const oldRooms: RoomId[] = [...gateway['rooms']];

            gateway.joinLimitedRoom(socket, 'testName');
            oldRooms.push(testRoomId);
            expect(gateway['rooms']).toEqual(oldRooms);
        });
        it('should call createGame on game manager', () => {
            const spy = jest.spyOn(gameManager, 'createGame');

            gateway.joinLimitedRoom(socket, 'testName');
            expect(spy).toHaveBeenCalledWith(testRoomId, 0, false);
        });
        it('should call addPlayerName on game manager', () => {
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(testGameRoom);
            const spy = jest.spyOn(gameManager, 'addPlayerName');

            gateway.joinLimitedRoom(socket, 'testName');
            expect(spy).toHaveBeenCalledWith(testGameRoom, socket.id, 'testName');
        });
        it('should call join on socket', () => {
            const spy = jest.spyOn(socket, 'join');

            gateway.joinLimitedRoom(socket, 'testName');
            expect(spy).toHaveBeenCalledWith('limited ' + socket.id);
        });
        it("should call emit on socket with 'limitedGameId'", () => {
            const spy = jest.spyOn(socket, 'emit');

            gateway.joinLimitedRoom(socket, 'testName');
            expect(spy).toHaveBeenCalledWith('limitedGameId', 0);
        });
        it('should not call createGame on the game manager if pendingLimitedGame exists', () => {
            gateway['pendingLimitedGame'] = 'testGame';
            jest.spyOn(gateway, 'setLimitedGameMode').mockReturnValue();
            const spy = jest.spyOn(gameManager, 'createGame');

            gateway.joinLimitedRoom(socket, 'testName');
            expect(spy).not.toHaveBeenCalled();
        });
        it('should call join on socket if pendingLimitedGame exists', () => {
            gateway['pendingLimitedGame'] = 'testGame';
            jest.spyOn(gateway, 'setLimitedGameMode').mockReturnValue();
            const spy = jest.spyOn(socket, 'join');

            gateway.joinLimitedRoom(socket, 'testName');
            expect(spy).toHaveBeenCalledWith('testGame');
        });
        it('should call findGameRoom on game manager if pendingLimiteGame exists', () => {
            gateway['pendingLimitedGame'] = 'testGame';
            jest.spyOn(gateway, 'setLimitedGameMode').mockReturnValue();
            const spy = jest.spyOn(gameManager, 'findGameRoom');

            gateway.joinLimitedRoom(socket, 'testName');
            expect(spy).toHaveBeenCalledWith('testGame');
        });
        it('should call addGuest on game manager if pendingLimiteGame exists', () => {
            gateway['pendingLimitedGame'] = 'testGame';
            jest.spyOn(gateway, 'setLimitedGameMode').mockReturnValue();
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(testGameRoom);
            const spy = jest.spyOn(gameManager, 'addGuest');

            gateway.joinLimitedRoom(socket, 'testName');
            expect(spy).toHaveBeenCalledWith(testGameRoom, socket.id);
        });
        it('should call addPlayerName on game manager if pendingLimiteGame exists', () => {
            gateway['pendingLimitedGame'] = 'testGame';
            jest.spyOn(gateway, 'setLimitedGameMode').mockReturnValue();
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(testGameRoom);
            const spy = jest.spyOn(gameManager, 'addPlayerName');

            gateway.joinLimitedRoom(socket, 'testName');
            expect(spy).toHaveBeenCalledWith(testGameRoom, socket.id, 'testName');
        });
        it('should call setLimitedGameMode on the service if pendingLimiteGame exists', () => {
            gateway['pendingLimitedGame'] = 'testGame';
            const spy = jest.spyOn(gateway, 'setLimitedGameMode').mockReturnValue();

            gateway.joinLimitedRoom(socket, 'testName');
            expect(spy).toHaveBeenCalledWith(socket);
        });
        it('should emit the room joined event on the pending limited game id if pendingLimiteGame exists', () => {
            gateway['pendingLimitedGame'] = 'testGame';
            jest.spyOn(gateway, 'setLimitedGameMode').mockReturnValue();
            const spy = jest.spyOn(server.to('testGame'), 'emit');

            gateway.joinLimitedRoom(socket, 'testName');
            expect(spy).toHaveBeenCalledWith('roomJoined');
        });
        it('should reset the pendingLimitedGame to an empty string if pendingLimiteGame exists', () => {
            gateway['pendingLimitedGame'] = 'testGame';
            jest.spyOn(gateway, 'setLimitedGameMode').mockReturnValue();

            gateway.joinLimitedRoom(socket, 'testName');
            expect(gateway['pendingLimitedGame']).toBe('');
        });
    });

    describe('createRoom', () => {
        it('should call findLowestAvailableRoomIndex', () => {
            jest.spyOn(server, 'to').mockReturnThis();
            Object.assign(socket, { id: 'simon' });
            const spy = jest.spyOn<any, string>(gateway, 'findLowestAvailableRoomIndex').mockReturnValue(0);
            jest.spyOn(gameService, 'getGame').mockImplementation(() => {
                return {
                    originalImage: 'test',
                    modifiedImage: 'test',
                    id: 0,
                    name: '',
                    url: '',
                    solo: [],
                    multiplayer: [],
                    differenceImage: [],
                };
            });
            gateway.createRoom(socket, 0);
            expect(spy).toBeCalled();
        });
        it('should add to pendingRooms, rooms and gameRooms', () => {
            jest.spyOn(server, 'to').mockReturnThis();
            const room: RoomId = {
                hostId: 'simon',
                gameId: 0,
                roomNumber: 0,
                stringFormat: '0 0',
            };
            jest.spyOn(gameService, 'getGame').mockImplementation(() => {
                return {
                    originalImage: 'test',
                    modifiedImage: 'test',
                    id: 0,
                    name: '',
                    url: '',
                    solo: [],
                    multiplayer: [],
                    differenceImage: [],
                };
            });
            const spy = jest.spyOn(gameManager, 'createGame').mockImplementation(() => {
                return;
            });
            Object.assign(socket, { id: 'simon' });
            jest.spyOn<any, string>(gateway, 'findLowestAvailableRoomIndex').mockReturnValue(0);
            gateway['pendingGames'] = [];
            gateway['rooms'] = [room];
            gateway.createRoom(socket, 0);
            expect(gateway['rooms']).toEqual([room, room]);
            expect(gateway['pendingGames']).toEqual([room]);
            expect(spy).toHaveBeenCalledTimes(1);
        });
        it('should call emit to select', () => {
            jest.spyOn(gameService, 'getGame').mockImplementation(() => {
                return {
                    originalImage: 'test',
                    modifiedImage: 'test',
                    id: 0,
                    name: '',
                    url: '',
                    solo: [],
                    multiplayer: [],
                    differenceImage: [],
                };
            });
            const spy = jest.spyOn(server, 'to').mockReturnThis();
            Object.assign(socket, { id: 'simon' });
            jest.spyOn<any, string>(gateway, 'findLowestAvailableRoomIndex').mockReturnValue(0);
            gateway.createRoom(socket, 0);
            expect(spy).toBeCalledWith('select');
        });
    });

    describe('leaveRoom', () => {
        it('should call leave with second room in socket.rooms if roomName is not "gameRoom"', () => {
            const spy = jest.spyOn(socket, 'leave');
            jest.spyOn(server, 'to').mockReturnThis();
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon', '2 0']));
            gateway.leaveRoom(socket, 'gameRoom');
            expect(spy).toHaveBeenCalledWith('2 0');
        });
        it('should call leave with roomName if it isnt "gameRoom"', () => {
            const spy = jest.spyOn(socket, 'leave');
            jest.spyOn(server, 'to').mockReturnThis();
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon', 'select']));
            gateway.leaveRoom(socket, 'select');
            expect(spy).toHaveBeenCalledWith('select');
        });
    });

    describe('abandonMultiplayerRoom', () => {
        beforeEach(() => {
            jest.spyOn(gateway, 'leaveGameRoom').mockImplementation();
            jest.spyOn(server, 'to').mockReturnThis();
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(mockGameRoom);
        });
        it('should call leave with second room in socket.rooms', () => {
            const spy = jest.spyOn<any, any>(gateway, 'leaveGameRoom').mockImplementation();
            Object.assign(socket, { id: 'simon' });
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon', '2 0']));
            jest.spyOn(gameManager, 'findOpponent').mockImplementation(() => {
                return { socketId: '', name: '', differencesFound: [] };
            });
            jest.spyOn<any, string>(gateway, 'endMultiplayerClassicGame').mockImplementation();
            gateway['rooms'] = [
                {
                    hostId: 'simon',
                    gameId: 0,
                    roomNumber: 0,
                    stringFormat: '2 0',
                },
            ];
            gateway.abandonMultiplayerRoom(socket);
            expect(spy).toHaveBeenCalled();
        });
        it('should call endMultiplayerClassicGame', () => {
            jest.spyOn(socket, 'leave');
            Object.assign(socket, { id: 'simon' });
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon', '2 0']));
            jest.spyOn(gameManager, 'findOpponent').mockImplementation(() => {
                return { socketId: 'simon', name: 'simon', differencesFound: [] };
            });
            const spy = jest.spyOn<any, string>(gateway, 'endMultiplayerClassicGame').mockImplementation();
            gateway['rooms'] = [
                {
                    hostId: 'simon',
                    gameId: 0,
                    roomNumber: 0,
                    stringFormat: '2 0',
                },
            ];
            gateway.abandonMultiplayerRoom(socket);
            expect(spy).toHaveBeenCalledWith(socket, 'simon', 'simon');
        });
    });

    describe('winMultiplayerClassicGame', () => {
        it('should call leaveGameRoom if a socketId is passed', async () => {
            Object.assign(socket, { id: 'simon' });
            jest.spyOn(gateway['rooms'], 'find').mockReturnValue(mockGameRoom.roomId);
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon', '2 0']));
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(mockGameRoom);
            jest.spyOn(gameManager, 'getWinnerRanking').mockResolvedValue(-1);
            jest.spyOn(server, 'to').mockReturnThis();
            const spy = jest.spyOn(server.to('select'), 'emit');
            await gateway['winMultiplayerClassicGame'](socket, 'simon', 'blabla');
            expect(spy).toHaveBeenCalledWith(GameEvents.PlayerWonGame, { socketId: 'blabla', name: 'simon' }, { ranking: -1, time: undefined });
        });

        it('should call removeAndLeaveRoom once if no socketId is passed', async () => {
            Object.assign(socket, { id: 'simon' });
            jest.spyOn(gateway['rooms'], 'find').mockReturnValue(mockGameRoom.roomId);
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon', '2 0']));
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(mockGameRoom);
            jest.spyOn(server, 'to').mockReturnThis();
            const spy = jest.spyOn(server.to('select'), 'emit');
            await gateway['winMultiplayerClassicGame'](socket, 'simon', undefined);
            expect(spy).toHaveBeenCalledWith(GameEvents.PlayerWonGame, { socketId: 'simon', name: 'simon' }, { ranking: -1, time: undefined });
        });

        it('should emit the event on the room', async () => {
            Object.assign(socket, { id: 'simon' });
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon', 'testRoom']));
            jest.spyOn(socket, 'leave');
            jest.spyOn(server, 'to').mockReturnThis();
            const spy = jest.spyOn(server.to('select'), 'emit');
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(mockGameRoom);
            gateway['rooms'] = [
                {
                    hostId: 'simon',
                    gameId: 0,
                    roomNumber: 0,
                    stringFormat: 'testRoom',
                },
            ];
            await gateway['winMultiplayerClassicGame'](socket, 'name');
            expect(spy).toHaveBeenCalledWith(GameEvents.PlayerWonGame, { socketId: 'simon', name: 'name' }, { ranking: -1, time: undefined });
        });
    });

    describe('abandonLimitedGameRoom', () => {
        let testRoomId: RoomId;
        let testGameRoom: GameRoom;

        beforeEach(() => {
            testRoomId = {
                gameId: 0,
                roomNumber: 0,
                stringFormat: 'limited' + ' ' + socket.id,
                hostId: socket.id,
            };

            const player: Player = { socketId: '', name: '', differencesFound: [] };
            testGameRoom = {
                roomId: testRoomId,
                host: player,
                guest: player,
                numberDifferences: 0,
                clock: 0,
                gameStarted: true,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: true,
                gameIds: [],
            };

            jest.spyOn(server, 'to').mockReturnThis();
        });

        it('should call findGameRoom on the game manager', () => {
            const spy = jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(testGameRoom);

            gateway.abandonLimitedGameRoom(socket);
            expect(spy).toHaveBeenCalledWith(socket.id);
        });
        it('should emit the participant left event', () => {
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(testGameRoom);
            const spy = jest.spyOn(server.to('limited ' + socket.id), 'emit');

            gateway.abandonLimitedGameRoom(socket);
            expect(spy).toHaveBeenCalledWith(GameEvents.ParticipantLeft, socket.id);
        });
        it('should leave the socket', () => {
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(testGameRoom);
            const spy = jest.spyOn(socket, 'leave');

            gateway.abandonLimitedGameRoom(socket);
            expect(spy).toHaveBeenCalledWith('limited ' + socket.id);
        });
    });

    describe('deleteRoom', () => {
        beforeEach(() => {
            jest.spyOn<any, string>(gateway, 'removeRoom').mockImplementation(() => {
                return;
            });
            jest.spyOn(server, 'to').mockReturnThis();
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon', 'testRoom']));
            Object.assign(socket, { id: 'simon' });
        });
        it('should call removeRoom', () => {
            const spy = jest.spyOn<any, string>(gateway, 'removeRoom').mockImplementation(() => {
                return;
            });
            gateway.deleteRoom(socket);
            expect(spy).toHaveBeenCalledWith('testRoom');
        });
        it('should emit the RoomClosed event', () => {
            jest.spyOn(socket, 'leave');
            const spy = jest.spyOn(server.to('select'), 'emit');
            gateway.deleteRoom(socket);
            expect(spy).toHaveBeenCalledWith(GameEvents.RoomClosed, 'testRoom');
        });
        it('should call leave with the room', () => {
            const spy = jest.spyOn(socket, 'leave');
            gateway.deleteRoom(socket);
            expect(spy).toHaveBeenCalledWith('testRoom');
        });
        it('should emit the RoomDeleted event', () => {
            jest.spyOn(socket, 'leave');
            const spy = jest.spyOn(server.to('select'), 'emit');
            gateway.deleteRoom(socket);
            expect(spy).toHaveBeenCalledWith(GameEvents.RoomDeleted);
        });
    });

    describe('leaveGameRoom', () => {
        beforeEach(() => {
            gateway['rooms'] = [
                {
                    gameId: 0,
                    roomNumber: 0,
                    stringFormat: 'simon',
                    hostId: '',
                },
                {
                    gameId: 0,
                    roomNumber: 0,
                    stringFormat: 'test',
                    hostId: '',
                },
            ];
            Object.assign(socket, { id: 'simon' });
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon', 'test']));
        });
        it('should remove the room from the room list if other player already left', () => {
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue({
                gameIds: [],
                gameStarted: true,
                roomId: {
                    hostId: 'simon',
                    stringFormat: 'simon',
                    gameId: 0,
                    roomNumber: 0,
                },
                host: {
                    socketId: 'simon',
                    name: 'simon',
                    differencesFound: [],
                },
                guest: {
                    socketId: '',
                    name: 'passimon',
                    differencesFound: [],
                },
                numberDifferences: 0,
                clock: 0,
                constants: undefined,
                isLimitedTime: false,
            });
            gateway.leaveGameRoom(socket);
            expect(gateway['rooms']).toEqual([
                {
                    gameId: 0,
                    roomNumber: 0,
                    stringFormat: 'test',
                    hostId: '',
                },
            ]);
        });
        it('should remove the room from the room list if other player already left', () => {
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(undefined);
            const leaveSpy = jest.spyOn(socket, 'leave');
            const removeAndLeaveRoomSpy = jest.spyOn<any, any>(gateway, 'removeAndLeaveRoom');
            gateway.leaveGameRoom(socket);
            expect(leaveSpy).not.toHaveBeenCalled();
            expect(removeAndLeaveRoomSpy).not.toHaveBeenCalled();
        });
        it('should call leave on the socket with the removed room', () => {
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue({
                gameIds: [],
                gameStarted: true,
                roomId: {
                    hostId: 'simon',
                    stringFormat: 'simon',
                    gameId: 0,
                    roomNumber: 0,
                },
                host: {
                    socketId: 'passimon',
                    name: 'simon',
                    differencesFound: [],
                },
                guest: {
                    socketId: 'simon',
                    name: 'passimon',
                    differencesFound: [],
                },
                numberDifferences: 0,
                clock: 0,
                constants: undefined,
                isLimitedTime: false,
            });
            const spy = jest.spyOn(socket, 'leave');
            gateway.leaveGameRoom(socket);
            expect(spy).toHaveBeenCalledWith('simon');
        });
    });

    describe('playerName', () => {
        it('should emit to the room currently used', () => {
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon', 'room']));
            const spy = jest.spyOn(server, 'to').mockReturnThis();
            gateway.playerName(socket, 'test');
            expect(spy).toHaveBeenCalledWith('room');
        });
        it('should send the player name to the clients', () => {
            jest.spyOn(server, 'to').mockReturnThis();
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon', 'room']));
            const spy = jest.spyOn(server.to('room'), 'emit');
            gateway.playerName(socket, 'test');
            expect(spy).toHaveBeenCalledWith(GameEvents.OpponentName, { name: 'test', socketId: undefined });
        });
    });

    describe('createdGame', () => {
        it('should emit a modifiedDatabase message', () => {
            const spy = jest.spyOn(gateway['server'], 'emit').mockImplementation();
            gateway.createdGame(socket);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('deleteGame', () => {
        it('should call the deletion method in game service', () => {
            const spy = jest.spyOn(gameService, 'deleteGame').mockImplementation();
            jest.spyOn(gateway['server'], 'emit').mockImplementation();
            gateway.deleteGame(socket, 0);
            expect(spy).toHaveBeenCalledWith(0, gateway['rooms'], gateway['pendingGames']);
        });
        it('should call the deletion method in game service', async () => {
            jest.spyOn(gameService, 'deleteGame').mockResolvedValue(true);
            const spy = jest.spyOn(gateway['server'], 'emit').mockImplementation();
            await gateway.deleteGame(socket, 0);
            expect(spy).toHaveBeenCalledWith(GameEvents.DeletedGame, 0);
        });
    });

    describe('deleteGames', () => {
        it('should emit the right amount of delete game messages', async () => {
            const spy = jest.spyOn(gateway['server'], 'emit');
            jest.spyOn(gameService, 'deleteGames').mockResolvedValue([1, 2, 3, 4]);
            await gateway.deleteGames(socket);
            expect(spy).toHaveBeenCalledTimes(5);
            expect(spy).toHaveBeenLastCalledWith(GameEvents.ModifiedDatabase);
        });

        it('should emit FailedDeleteAll for failed query', async () => {
            const spy = jest.spyOn(socket, 'emit');
            jest.spyOn(gameService, 'deleteGames').mockRejectedValue('');
            await gateway.deleteGames(socket);
            expect(spy).toHaveBeenCalledWith(GameEvents.FailedDeleteAll);
        });
    });

    describe('resetGame', () => {
        it('should call the reset method in game service', async () => {
            const spy = jest.spyOn(gameService, 'resetGame').mockResolvedValue();
            jest.spyOn(gateway['server'], 'emit').mockImplementation();
            await gateway.resetGame(socket, 0);
            expect(spy).toHaveBeenCalledWith(0);
        });
        it('should emit the right event', async () => {
            jest.spyOn(gameService, 'resetGame').mockResolvedValue();
            const spy = jest.spyOn(gateway['server'], 'emit').mockImplementation();
            await gateway.resetGame(socket, 0);
            expect(spy).toHaveBeenCalledWith(GameEvents.ModifiedDatabase);
        });
        it('should emit the right event', async () => {
            jest.spyOn(gameService, 'resetGame').mockRejectedValue({});
            const spy = jest.spyOn(gateway['server'], 'emit').mockImplementation();
            await gateway.resetGame(socket, 0);
            expect(spy).toHaveBeenCalledWith(GameEvents.FailedReset);
        });
    });

    describe('resetGames', () => {
        it('should call the reset method in game service', async () => {
            const spy = jest.spyOn(gameService, 'resetGames').mockResolvedValue();
            jest.spyOn(gateway['server'], 'emit').mockImplementation();
            await gateway.resetGames(socket);
            expect(spy).toHaveBeenCalled();
        });
        it('should emit the right event', async () => {
            jest.spyOn(gameService, 'resetGames').mockResolvedValue();
            const spy = jest.spyOn(gateway['server'], 'emit').mockImplementation();
            await gateway.resetGames(socket);
            expect(spy).toHaveBeenCalledWith(GameEvents.ModifiedDatabase);
        });

        it('should emit FailedResetAll for failed query', async () => {
            const spy = jest.spyOn(socket, 'emit');
            jest.spyOn(gameService, 'resetGames').mockRejectedValue('');
            await gateway.resetGames(socket);
            expect(spy).toHaveBeenCalledWith(GameEvents.FailedResetAll);
        });
    });

    describe('createSoloGame', () => {
        it('should create a new basic room', () => {
            gateway['rooms'] = [];
            const roomId: RoomId = {
                gameId: 3,
                roomNumber: 0,
                stringFormat: socket.id,
                hostId: socket.id,
            };
            jest.spyOn(gameService, 'getGame').mockImplementation(() => {
                return {
                    originalImage: 'test',
                    modifiedImage: 'test',
                    id: 0,
                    name: '',
                    url: '',
                    solo: [],
                    multiplayer: [],
                    differenceImage: [],
                };
            });
            jest.spyOn(gameManager, 'createGame').mockImplementation(() => {
                return;
            });
            gateway['createSoloGame'](socket, 3);
            expect(gateway['rooms'][0]).toEqual(roomId);
        });
    });

    describe('deleteSoloGame', () => {
        it('should remove the room', () => {
            const spy = jest.spyOn<any, string>(gateway, 'removeRoom').mockImplementation();
            gateway['deleteSoloGame'](socket);
            expect(spy).toHaveBeenCalledWith(socket.id);
        });
    });

    describe('setLimitedGameMode', () => {
        let testRoomId: RoomId;
        let testGameRoom: GameRoom;

        beforeEach(() => {
            testRoomId = {
                gameId: 0,
                roomNumber: 0,
                stringFormat: 'limited' + ' ' + socket.id,
                hostId: socket.id,
            };

            const player: Player = { socketId: '', name: '', differencesFound: [] };
            testGameRoom = {
                roomId: testRoomId,
                host: player,
                guest: player,
                numberDifferences: 0,
                clock: 0,
                gameStarted: true,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: true,
                gameIds: [5],
            };

            jest.spyOn(server, 'to').mockReturnThis();
        });

        it('should call findGameRoom on game manager', () => {
            const spy = jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(testGameRoom);

            gateway.setLimitedGameMode(socket);
            expect(spy).toHaveBeenCalledWith(socket.id);
        });
        it('should call getNextLimitedGame on the game service', () => {
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(testGameRoom);
            const spy = jest.spyOn(gameService, 'getNextLimitedGame').mockReturnValue(2);

            gateway.setLimitedGameMode(socket);
            expect(spy).toHaveBeenCalledWith(testGameRoom);
        });
        it('should call goToNextGame on game manager', () => {
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(testGameRoom);
            jest.spyOn(gameService, 'getNextLimitedGame').mockReturnValue(2);
            const spy = jest.spyOn(gameManager, 'goToNextGame');

            gateway.setLimitedGameMode(socket);
            expect(spy).toHaveBeenCalledWith(testGameRoom, 2);
        });
        it('should call setGameMode on game manager', () => {
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(testGameRoom);
            const spy = jest.spyOn(gameManager, 'setGameMode');

            gateway.setLimitedGameMode(socket);
            expect(spy).toHaveBeenCalledWith(testGameRoom, true);
        });
        it('should emit "limitedGameId" if there is at least on gameId', () => {
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(testGameRoom);
            const spy = jest.spyOn(server.to('limited ' + socket.id), 'emit');

            gateway.setLimitedGameMode(socket);
            expect(spy).toHaveBeenCalledWith('limitedGameId', 5);
        });
        it('should call endLimitedGame if there is no more gameIds', () => {
            testGameRoom.gameIds = [];
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(testGameRoom);
            const spy = jest.spyOn<any, any>(gateway, 'endLimitedGame');

            gateway.setLimitedGameMode(socket);
            expect(spy).toHaveBeenCalledWith(testGameRoom, 0, true);
        });
    });

    describe('removeRoom', () => {
        it('should remove the room from the pending games and the current rooms', () => {
            const roomId: RoomId = {
                gameId: 3,
                roomNumber: 0,
                stringFormat: 'test',
                hostId: socket.id,
            };
            gateway['pendingGames'] = [roomId];
            gateway['rooms'] = [roomId];
            gateway['removeRoom']('test');
            expect(gateway['pendingGames'].length).toBe(0);
            expect(gateway['rooms'].length).toBe(0);
        });
        it('should call updateTempDeletedGames', () => {
            const roomId: RoomId = {
                gameId: 3,
                roomNumber: 0,
                stringFormat: 'test',
                hostId: socket.id,
            };
            gateway['rooms'] = [roomId];
            const spy = jest.spyOn(gateway['gameService'], 'updateTempDeletedGames').mockImplementation();
            gateway['removeRoom']('test');
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('removeAndLeaveRoom', () => {
        it('should call removeRoom', () => {
            const spy = jest.spyOn<any, any>(gateway, 'removeRoom');
            gateway['removeAndLeaveRoom'](socket, 'room');
            expect(spy).toHaveBeenCalled();
        });
        it('should call removeRoom', () => {
            const spy = jest.spyOn<any, any>(socket, 'leave').mockImplementation();
            gateway['removeAndLeaveRoom'](socket, 'room');
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('sendPlayerReady', () => {
        it('should emit playerReady to gameRoom', () => {
            Object.assign(socket, { id: 'simon' });
            jest.spyOn(gameManager, 'findGameRoom').mockImplementation(() => {
                return {
                    roomId: {
                        gameId: undefined,
                        roomNumber: 0,
                        stringFormat: 'room',
                        hostId: undefined,
                    },
                    host: undefined,
                    guest: undefined,
                    numberDifferences: 0,
                    clock: 0,
                    gameStarted: true,
                    constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                    isLimitedTime: false,
                    gameIds: [],
                };
            });
            jest.spyOn(server, 'to').mockReturnThis();
            const emitSpy = jest.spyOn(server.to('room'), 'emit');
            gateway.sendPlayerReady(socket, { name: 'test', socketId: 'simon' });
            expect(emitSpy).toHaveBeenCalledWith(GameEvents.PlayerReady, { name: 'test', socketId: 'simon' });
        });
    });

    describe('handleDisconnect', () => {
        let roomSpy: jest.SpyInstance;
        let toSpy: jest.SpyInstance;
        beforeEach(() => {
            jest.spyOn(gateway, 'leaveGameRoom').mockImplementation();
            roomSpy = jest.spyOn(gameManager, 'findGameRoom').mockReturnValue({
                roomId: {
                    gameId: 0,
                    roomNumber: 0,
                    stringFormat: '0 0',
                    hostId: socket.id,
                },
                host: undefined,
                guest: undefined,
                numberDifferences: 0,
                clock: 0,
                gameStarted: false,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: true,
                gameIds: [5],
            });
            toSpy = jest.spyOn(server, 'to').mockReturnThis();
        });
        it('should broadcast participant left if player is not host of a waiting room but is host of room', () => {
            gateway['pendingGames'] = [];
            gateway['rooms'] = [{ gameId: 0, hostId: 'simon', roomNumber: 0, stringFormat: '0 0' }];
            Object.assign(socket, { id: 'simon' });
            jest.spyOn(server, 'to').mockReturnThis();
            const emitSpy = jest.spyOn(server.to('roomName'), 'emit');
            jest.spyOn<any, string>(gateway, 'sendAbandonMessage').mockImplementation(() => {
                return;
            });
            jest.spyOn<any, string>(gateway, 'endMultiplayerClassicGame').mockImplementation(() => {
                return;
            });
            jest.spyOn(gameManager, 'findOpponent').mockImplementation(() => {
                return { socketId: '', name: '', differencesFound: [] };
            });
            gateway.handleDisconnect(socket);
            expect(emitSpy).toHaveBeenCalledWith(GameEvents.ParticipantLeft, 'simon');
        });
        it('should delete pendingWaitingGame if host disconnect', () => {
            gateway['pendingGames'] = [];
            gateway['pendingLimitedGame'] = '0 0';
            gateway['rooms'] = [{ gameId: 0, hostId: 'simon', roomNumber: 0, stringFormat: 'room' }];
            gateway.handleDisconnect(socket);
            expect(gateway['pendingLimitedGame']).toEqual('');
        });
        it('should call endMultiplayerClassicGame', () => {
            gateway['pendingGames'] = [];
            gateway['rooms'] = [{ gameId: 0, hostId: 'simon', roomNumber: 0, stringFormat: 'room' }];
            roomSpy.mockReturnValue({
                roomId: {
                    gameId: 0,
                    roomNumber: 0,
                    stringFormat: '0 0',
                    hostId: socket.id,
                },
                host: undefined,
                guest: undefined,
                numberDifferences: 0,
                clock: 0,
                gameStarted: false,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: false,
                gameIds: [5],
            });
            jest.spyOn(gameManager, 'findOpponent').mockImplementation(() => {
                return { socketId: '', name: '', differencesFound: [] };
            });
            const bo = createStubInstance(BroadcastOperator);
            jest.spyOn(socket, 'broadcast', 'get').mockReturnValue(bo);
            jest.spyOn(bo, 'emit');
            jest.spyOn(gateway, 'sendMessage').mockImplementation();
            jest.spyOn(gateway, 'leaveGameRoom').mockImplementation();
            const spy = jest.spyOn<any, any>(gateway, 'endMultiplayerClassicGame');
            gateway.handleDisconnect(socket);
            expect(spy).toHaveBeenCalled();
        });
        it('should broadcast participant left if player is not host of a waiting room but is not in a room', () => {
            gateway['pendingGames'] = [];
            gateway['rooms'] = [];
            Object.assign(socket, { id: 'simon' });
            const bo = createStubInstance(BroadcastOperator);
            jest.spyOn(socket, 'broadcast', 'get').mockReturnValue(bo);
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(undefined);
            const spy = jest.spyOn(bo, 'emit');
            gateway.handleDisconnect(socket);
            expect(spy).toHaveBeenCalledWith(GameEvents.ParticipantLeft, 'simon');
        });
        it('should emit to select if player is host of a waiting room', () => {
            gateway['pendingGames'] = [{ gameId: 0, hostId: 'simon', roomNumber: 0, stringFormat: '0 0' }];
            Object.assign(socket, { id: 'simon' });
            jest.spyOn<any, string>(gateway, 'removeRoom').mockImplementation();
            const emitSpy = jest.spyOn(server.to('select'), 'emit');
            gateway.handleDisconnect(socket);
            expect(toSpy).toHaveBeenCalledWith('select');
            expect(emitSpy).toHaveBeenCalledWith(GameEvents.RoomClosed, '0 0');
        });
        it('should emit to gameRoom if player is host of a waiting room', () => {
            gateway['pendingGames'] = [{ gameId: 0, hostId: 'simon', roomNumber: 0, stringFormat: '0 0' }];
            Object.assign(socket, { id: 'simon' });
            jest.spyOn<any, string>(gateway, 'removeRoom').mockImplementation();
            const emitSpy = jest.spyOn(server.to('roomName'), 'emit');
            gateway.handleDisconnect(socket);
            expect(toSpy).toHaveBeenCalledWith('roomName');
            expect(emitSpy).toHaveBeenCalledWith(GameEvents.RoomDeleted);
        });
        it('should emit participant left if gameRoom is valid', () => {
            gateway['pendingGames'] = [{ gameId: 0, hostId: 'simon', roomNumber: 0, stringFormat: '' }];
            Object.assign(socket, { id: 'simon' });
            jest.spyOn(server, 'to').mockReturnThis();
            jest.spyOn<any, any>(gateway, 'sendAbandonMessage').mockImplementation();
            jest.spyOn<any, string>(gateway, 'removeRoom').mockImplementation();
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue({
                roomId: {
                    gameId: 0,
                    roomNumber: 0,
                    stringFormat: 'limited' + ' ' + socket.id,
                    hostId: socket.id,
                },
                host: undefined,
                guest: undefined,
                numberDifferences: 0,
                clock: 0,
                gameStarted: false,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: true,
                gameIds: [5],
            });
            const spy = jest.spyOn(server.to('limited ' + socket.id), 'emit');

            gateway.handleDisconnect(socket);
            expect(spy).toHaveBeenCalledWith(GameEvents.ParticipantLeft, socket.id);
        });
    });

    describe('findLowestAvailableRoomIndex', () => {
        it('should return lowest index available for roomNumber', () => {
            const gameRooms: RoomId[] = [
                { gameId: 0, roomNumber: 0, hostId: '', stringFormat: '0 0' },
                { gameId: 0, roomNumber: 1, hostId: '', stringFormat: '0 1' },
                { gameId: 0, roomNumber: 3, hostId: '', stringFormat: '0 3' },
                { gameId: 0, roomNumber: 4, hostId: '', stringFormat: '0 4' },
            ];
            expect(gateway['findLowestAvailableRoomIndex'](gameRooms)).toEqual(2);
        });
        it('should return lowest index available for roomNumber if array is empty', () => {
            const gameRooms: RoomId[] = [];
            expect(gateway['findLowestAvailableRoomIndex'](gameRooms)).toEqual(0);
        });
        it('should return lowest index available for roomNumber if array is full', () => {
            const gameRooms: RoomId[] = [
                { gameId: 0, roomNumber: 0, hostId: '', stringFormat: '0 0' },
                { gameId: 0, roomNumber: 1, hostId: '', stringFormat: '0 1' },
                { gameId: 0, roomNumber: 2, hostId: '', stringFormat: '0 2' },
                { gameId: 0, roomNumber: 3, hostId: '', stringFormat: '0 3' },
            ];
            expect(gateway['findLowestAvailableRoomIndex'](gameRooms)).toEqual(4);
        });
    });

    describe('multiplayerValidAttempt', () => {
        it('should call the correct methods', () => {
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon', '0 0']));
            const updateSpy = jest.spyOn(gameManager, 'updateDifferencesFound').mockImplementation(() => {
                return;
            });
            const validationSpy = jest.spyOn<any, string>(gateway, 'sendValidationMessage').mockImplementation(() => {
                return;
            });
            const manageSpy = jest.spyOn<any, string>(gateway, 'manageGameEnd').mockImplementation(() => {
                return;
            });
            const toSpy = jest.spyOn(server, 'to').mockReturnThis();
            const emitSpy = jest.spyOn(server.to('0 0'), 'emit');
            gateway['multiplayerValidAttempt'](socket, undefined, { differenceNumber: 0, positions: [] });
            expect(updateSpy).toHaveBeenCalled();
            expect(validationSpy).toHaveBeenCalled();
            expect(manageSpy).toHaveBeenCalled();
            expect(toSpy).toHaveBeenCalled();
            expect(emitSpy).toHaveBeenCalled();
        });
    });

    describe('soloValidAttempt', () => {
        it('should call the correct methods', () => {
            const updateSpy = jest.spyOn(gameManager, 'updateDifferencesFound').mockImplementation(() => {
                return;
            });
            const validationSpy = jest.spyOn<any, string>(gateway, 'sendValidationMessage').mockImplementation(() => {
                return;
            });
            const manageSpy = jest.spyOn<any, string>(gateway, 'manageGameEnd').mockImplementation(() => {
                return;
            });
            gateway['soloValidAttempt'](socket, undefined, { differenceNumber: 0, positions: [] });
            expect(updateSpy).toHaveBeenCalled();
            expect(validationSpy).toHaveBeenCalled();
            expect(manageSpy).toHaveBeenCalled();
        });
    });

    describe('sendErrorMessage', () => {
        it('should call sendMessage with the right body for solo', () => {
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon']));
            const spy = jest.spyOn<any, string>(gateway, 'sendMessage').mockImplementation(() => {
                return;
            });
            gateway['sendErrorMessage'](socket, {
                roomId: undefined,
                host: undefined,
                guest: undefined,
                numberDifferences: 0,
                clock: 0,
                gameStarted: true,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: false,
                gameIds: [],
            });
            expect(spy).toHaveBeenCalledWith(socket, { author: Authors.System, socketId: socket.id, body: SystemMessage.Error });
        });

        it('should call sendMessage with the right body for multi', () => {
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon', '0 0']));
            jest.spyOn(gameManager, 'findPlayerName').mockImplementation(() => {
                return 'simon';
            });
            const spy = jest.spyOn<any, string>(gateway, 'sendMessage').mockImplementation(() => {
                return;
            });
            gateway['sendErrorMessage'](socket, {
                roomId: undefined,
                host: undefined,
                guest: undefined,
                numberDifferences: 0,
                clock: 0,
                gameStarted: true,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: false,
                gameIds: [],
            });
            expect(spy).toHaveBeenCalledWith(socket, { author: Authors.System, socketId: socket.id, body: SystemMessage.Error + ' par ' + 'simon' });
        });
    });

    describe('sendAbandonMessage', () => {
        it('should call sendMessage with the right body', () => {
            jest.spyOn(gameManager, 'findPlayerName').mockImplementation(() => {
                return 'simon';
            });
            const spy = jest.spyOn<any, string>(gateway, 'sendMessage').mockImplementation(() => {
                return;
            });
            gateway['sendAbandonMessage'](socket, {
                roomId: undefined,
                host: undefined,
                guest: undefined,
                numberDifferences: 0,
                clock: 0,
                gameStarted: true,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: false,
                gameIds: [],
            });
            expect(spy).toHaveBeenCalledWith(socket, { author: Authors.System, socketId: socket.id, body: 'simon' + SystemMessage.Abandon });
        });
    });

    describe('sendValidationMessage', () => {
        it('should call sendMessage with the right body for solo', () => {
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon']));
            jest.spyOn<any, string>(Number.prototype, 'toLocaleString').mockImplementation(() => {
                return '1';
            });
            const spy = jest.spyOn<any, string>(gateway, 'sendMessage').mockImplementation(() => {
                return;
            });
            gateway['sendValidationMessage'](socket, {
                roomId: undefined,
                host: undefined,
                guest: undefined,
                numberDifferences: 0,
                clock: 0,
                gameStarted: true,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: false,
                gameIds: [],
            });
            expect(spy).toHaveBeenCalledWith(socket, {
                author: Authors.System,
                socketId: socket.id,
                body: SystemMessage.DifferenceFound,
            });
        });

        it('should call sendMessage with the right body for multi', () => {
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon', '0 0']));
            jest.spyOn(gameManager, 'findPlayerName').mockImplementation(() => {
                return 'simon';
            });
            jest.spyOn<any, string>(Number.prototype, 'toLocaleString').mockImplementation(() => {
                return '1';
            });
            const spy = jest.spyOn<any, string>(gateway, 'sendMessage').mockImplementation(() => {
                return;
            });
            gateway['sendValidationMessage'](socket, {
                roomId: undefined,
                host: undefined,
                guest: undefined,
                numberDifferences: 0,
                clock: 0,
                gameStarted: true,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: false,
                gameIds: [],
            });
            expect(spy).toHaveBeenCalledWith(socket, {
                author: Authors.System,
                socketId: socket.id,
                body: SystemMessage.DifferenceFound + ' par simon',
            });
        });
    });

    describe('manageGameEnd', () => {
        it('should call deleteSoloGame and emit if solo game is won', async () => {
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon']));
            jest.spyOn(gameManager, 'checkForSoloWin').mockReturnValue(true);
            jest.spyOn(gameManager, 'checkForClassicTie').mockReturnValue(false);
            jest.spyOn(gameManager, 'checkForClassicWin').mockReturnValue('');
            jest.spyOn(gameManager, 'getWinnerRanking').mockResolvedValue(PlayerRanking.First);
            jest.spyOn<any, any>(gateway, 'isNewRecord').mockReturnValue(false);
            const emitSpy = jest.spyOn(socket, 'emit');
            const spy = jest.spyOn(gateway, 'deleteSoloGame').mockImplementation();
            await gateway['manageGameEnd'](socket, {
                roomId: undefined,
                host: undefined,
                guest: undefined,
                numberDifferences: 0,
                clock: 0,
                gameStarted: true,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: false,
                gameIds: [],
            });
            expect(spy).toHaveBeenCalled();
            expect(emitSpy).toHaveBeenCalled();
        });

        it('should call sendGlobalMessage if there is a new record', async () => {
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon']));
            jest.spyOn(gameManager, 'checkForSoloWin').mockReturnValue(true);
            jest.spyOn(gameManager, 'checkForClassicTie').mockReturnValue(false);
            jest.spyOn(gameManager, 'checkForClassicWin').mockReturnValue('');
            jest.spyOn(gameManager, 'getWinnerRanking').mockResolvedValue(PlayerRanking.First);
            jest.spyOn(gameManager, 'getNewHighScoreMessage').mockReturnValue({ author: '', socketId: '', body: '' });
            jest.spyOn<any, any>(gateway, 'isNewRecord').mockReturnValue(true);
            jest.spyOn(gateway, 'deleteSoloGame').mockImplementation();
            jest.spyOn(socket, 'emit');
            const spy = jest.spyOn<any, any>(gateway, 'sendGlobalMessage').mockImplementation();
            await gateway['manageGameEnd'](socket, {
                roomId: undefined,
                host: undefined,
                guest: undefined,
                numberDifferences: 0,
                clock: 0,
                gameStarted: true,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: false,
                gameIds: [],
            });
            expect(spy).toHaveBeenCalled();
        });
        it('should call winMultiplayerClassicGame emit if multiplayer game is won', () => {
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon', '0 0']));
            jest.spyOn(gameManager, 'checkForClassicWin').mockImplementation(() => {
                return 'simon';
            });
            const spy = jest.spyOn<any, string>(gateway, 'winMultiplayerClassicGame').mockImplementation();
            gateway['manageGameEnd'](socket, {
                roomId: undefined,
                host: undefined,
                guest: undefined,
                numberDifferences: 0,
                clock: 0,
                gameStarted: true,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: false,
                gameIds: [],
            });
            expect(spy).toHaveBeenCalled();
        });

        it('should call removeAndLeaveRoom and emit if multiplayer game is tied', () => {
            jest.spyOn(socket, 'rooms', 'get').mockReturnValue(new Set<string>(['simon', '0 0']));
            jest.spyOn(gameManager, 'checkForClassicWin').mockImplementation(() => {
                return undefined;
            });
            jest.spyOn(server, 'to').mockReturnThis();
            const emitSpy = jest.spyOn(server.to('0 0'), 'emit');
            jest.spyOn(gameManager, 'checkForClassicTie').mockImplementation(() => {
                return true;
            });
            const spy = jest.spyOn<any, string>(gateway, 'removeAndLeaveRoom').mockImplementation(() => {
                return;
            });
            gateway['manageGameEnd'](socket, {
                roomId: undefined,
                host: undefined,
                guest: undefined,
                numberDifferences: 0,
                clock: 0,
                gameStarted: true,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: false,
                gameIds: [],
            });
            expect(spy).toHaveBeenCalled();
            expect(emitSpy).toHaveBeenCalled();
        });
    });
    describe('clueUsed', () => {
        it('should call findGameRoom from gameManager', () => {
            const spy = jest.spyOn(gameManager, 'findGameRoom').mockReturnValue({
                roomId: undefined,
                host: undefined,
                guest: undefined,
                numberDifferences: 0,
                clock: 0,
                gameStarted: true,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: false,
                gameIds: [],
            });
            jest.spyOn(gameManager, 'clueUsed').mockImplementation();
            gateway.clueUsed(socket);
            expect(spy).toHaveBeenCalled();
        });
        it('should call clueUsed from gameManager', () => {
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue({
                roomId: undefined,
                host: undefined,
                guest: undefined,
                numberDifferences: 0,
                clock: 0,
                gameStarted: true,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: false,
                gameIds: [],
            });
            const spy = jest.spyOn(gameManager, 'clueUsed').mockImplementation();
            gateway.clueUsed(socket);
            expect(spy).toHaveBeenCalled();
        });
        it('should call checkForLimitedGameEnd', () => {
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue({
                roomId: undefined,
                host: undefined,
                guest: undefined,
                numberDifferences: 0,
                clock: 0,
                gameStarted: true,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: false,
                gameIds: [],
            });
            jest.spyOn(gameManager, 'clueUsed').mockImplementation();
            const spy = jest.spyOn(gameManager, 'checkForLimitedGameEnd');

            gateway.clueUsed(socket);
            expect(spy).toHaveBeenCalled();
        });
        it('should call endLimitedGame if limited game finished', () => {
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue({
                roomId: undefined,
                host: undefined,
                guest: undefined,
                numberDifferences: 0,
                clock: 0,
                gameStarted: true,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: false,
                gameIds: [],
            });
            jest.spyOn(gameManager, 'clueUsed').mockImplementation();
            jest.spyOn(gameManager, 'checkForLimitedGameEnd').mockReturnValue(true);
            const spy = jest.spyOn<any, any>(gateway, 'endLimitedGame').mockImplementation();

            gateway.clueUsed(socket);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('startGame', () => {
        let testRoomId: RoomId;
        let testGameRoom: GameRoom;

        beforeEach(() => {
            testRoomId = {
                gameId: 0,
                roomNumber: 0,
                stringFormat: 'limited' + ' ' + socket.id,
                hostId: socket.id,
            };

            const player: Player = { socketId: '', name: '', differencesFound: [] };
            testGameRoom = {
                roomId: testRoomId,
                host: player,
                guest: player,
                numberDifferences: 0,
                clock: 0,
                gameStarted: false,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: true,
                gameIds: [5],
            };

            jest.spyOn(server, 'to').mockReturnThis();
        });

        it('should call findGameRoom on game manager', () => {
            const spy = jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(testGameRoom);

            gateway.startGame(socket);
            expect(spy).toHaveBeenCalledWith(socket.id);
        });
        it('should set gameStarted to true on the game room', () => {
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(testGameRoom);

            gateway.startGame(socket);
            expect(testGameRoom.gameStarted).toBeTruthy();
        });
    });

    describe('pauseTimer', () => {
        let testRoomId: RoomId;
        let testGameRoom: GameRoom;

        beforeEach(() => {
            testRoomId = {
                gameId: 0,
                roomNumber: 0,
                stringFormat: 'limited' + ' ' + socket.id,
                hostId: socket.id,
            };

            const player: Player = { socketId: '', name: '', differencesFound: [] };
            testGameRoom = {
                roomId: testRoomId,
                host: player,
                guest: player,
                numberDifferences: 0,
                clock: 0,
                gameStarted: true,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: true,
                gameIds: [5],
            };

            jest.spyOn(server, 'to').mockReturnThis();
        });

        it('should call findGameRoom on game manager', () => {
            const spy = jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(testGameRoom);

            gateway.pauseTimer(socket);
            expect(spy).toHaveBeenCalledWith(socket.id);
        });
        it('should set gameStarted to true on the game room', () => {
            jest.spyOn(gameManager, 'findGameRoom').mockReturnValue(testGameRoom);

            gateway.pauseTimer(socket);
            expect(testGameRoom.gameStarted).toBeFalsy();
        });
    });

    describe('limitedSearchCancelled', () => {
        it('should call removeAndLeaveRoom on the gateway', () => {
            gateway['pendingLimitedGame'] = 'testGame';
            const spy = jest.spyOn<any, any>(gateway, 'removeAndLeaveRoom').mockImplementation();

            gateway.limitedSearchCancelled(socket);
            expect(spy).toHaveBeenCalledWith(socket, 'testGame');
        });
        it('should set pendingLimitedGame to empty string', () => {
            gateway['pendingLimitedGame'] = 'testGame';
            jest.spyOn<any, any>(gateway, 'removeAndLeaveRoom').mockImplementation();

            gateway.limitedSearchCancelled(socket);
            expect(gateway['pendingLimitedGame']).toBe('');
        });
    });

    describe('afterInit', () => {
        // TODO : Find how to test that
    });

    describe('validateLimitedGameAttempt', () => {
        let testRoomId: RoomId;
        let testGameRoom: GameRoom;
        let difference: Difference;

        beforeEach(() => {
            testRoomId = {
                gameId: 0,
                roomNumber: 0,
                stringFormat: 'limited' + ' ' + socket.id,
                hostId: socket.id,
            };

            const player: Player = { socketId: '', name: '', differencesFound: [] };
            testGameRoom = {
                roomId: testRoomId,
                host: player,
                guest: player,
                numberDifferences: 0,
                clock: 0,
                gameStarted: true,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: true,
                gameIds: [5],
            };

            difference = {
                differenceNumber: 0,
                positions: [1, 2, 3],
            };

            jest.spyOn(server, 'to').mockReturnThis();
        });

        it('should emit the validation event if attemptValidation is undefined', () => {
            const spy = jest.spyOn(socket, 'emit');
            jest.spyOn<any, any>(gateway, 'sendErrorMessage').mockImplementation();

            gateway['validateLimitedGameAttempt'](socket, testGameRoom, undefined);
            expect(spy).toHaveBeenCalledWith(GameEvents.Validation, { difference: undefined, playerId: socket.id });
        });
        it('should call sendErrorMessage if attemptValidation is undefined', () => {
            const spy = jest.spyOn<any, any>(gateway, 'sendErrorMessage').mockImplementation();

            gateway['validateLimitedGameAttempt'](socket, testGameRoom, undefined);
            expect(spy).toHaveBeenCalledWith(socket, testGameRoom);
        });
        it('should call differenceFound on game manager if attemptValidation not undefined', () => {
            const spy = jest.spyOn(gameManager, 'differenceFound');

            gateway['validateLimitedGameAttempt'](socket, testGameRoom, difference);
            expect(spy).toHaveBeenCalledWith(testGameRoom);
        });
        it('should call getNextLimitedGame on game service if attemptValidation not undefined', () => {
            const spy = jest.spyOn(gameService, 'getNextLimitedGame');

            gateway['validateLimitedGameAttempt'](socket, testGameRoom, difference);
            expect(spy).toHaveBeenCalledWith(testGameRoom);
        });
        it('should emit to the roomId if attemptValidation not undefined', () => {
            const spy = jest.spyOn(server.to('limited ' + socket.id), 'emit');

            gateway['validateLimitedGameAttempt'](socket, testGameRoom, difference);
            expect(spy).toHaveBeenCalledWith(GameEvents.Validation, { difference, playerId: socket.id });
        });
        it('should call endLimitedGame if nextGame is undefined and if attemptValidation not undefined', () => {
            jest.spyOn(gameService, 'getNextLimitedGame').mockReturnValue(undefined);
            const spy = jest.spyOn<any, any>(gateway, 'endLimitedGame');

            gateway['validateLimitedGameAttempt'](socket, testGameRoom, difference);
            expect(spy).toHaveBeenCalledWith(testGameRoom, 1, true);
        });
        it('should not vall goToNextGame on the game manager if nextGame is undefined and if attemptValidation not undefined', () => {
            jest.spyOn(gameService, 'getNextLimitedGame').mockReturnValue(undefined);
            const spy = jest.spyOn(gameManager, 'goToNextGame');

            gateway['validateLimitedGameAttempt'](socket, testGameRoom, difference);
            expect(spy).not.toHaveBeenCalled();
        });
        it('should call goToNextGame of game manager if nextGame exists and if attemptValidation not undefined', () => {
            jest.spyOn<any, any>(gateway, 'sendValidationMessage').mockReturnValue(2);
            jest.spyOn(gameService, 'getNextLimitedGame').mockReturnValue(2);
            const spy = jest.spyOn(gameManager, 'goToNextGame');

            gateway['validateLimitedGameAttempt'](socket, testGameRoom, difference);
            expect(spy).toHaveBeenCalledWith(testGameRoom, 2);
        });
        it('should call sendValidationMessage if nextGame exists and if attemptValidation not undefined', () => {
            jest.spyOn(gameService, 'getNextLimitedGame').mockReturnValue(2);
            const spy = jest.spyOn<any, any>(gateway, 'sendValidationMessage').mockReturnValue(2);

            gateway['validateLimitedGameAttempt'](socket, testGameRoom, difference);
            expect(spy).toHaveBeenCalledWith(socket, testGameRoom);
        });
        it('should emit change game if nextGame exists and if attemptValidation not undefined', () => {
            jest.spyOn(gameService, 'getNextLimitedGame').mockReturnValue(2);
            jest.spyOn<any, any>(gateway, 'sendValidationMessage').mockReturnValue(2);
            const spy = jest.spyOn(server.to('limited ' + socket.id), 'emit');

            gateway['validateLimitedGameAttempt'](socket, testGameRoom, difference);
            expect(spy).toHaveBeenCalledWith(GameEvents.ChangeGame, 2);
        });
    });

    describe('endLimitedGame', () => {
        let testRoomId: RoomId;
        let testGameRoom: GameRoom;

        beforeEach(() => {
            testRoomId = {
                gameId: 0,
                roomNumber: 0,
                stringFormat: 'limited' + ' ' + socket.id,
                hostId: socket.id,
            };

            const player: Player = { socketId: '', name: '', differencesFound: [] };
            testGameRoom = {
                roomId: testRoomId,
                host: player,
                guest: player,
                numberDifferences: 0,
                clock: 0,
                gameStarted: true,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: true,
                gameIds: [5],
            };

            jest.spyOn(server, 'to').mockReturnThis();
        });

        it('should emit the limited game done event', () => {
            const spy = jest.spyOn(server.to('limited ' + socket.id), 'emit');

            gateway['endLimitedGame'](testGameRoom, 4, false);
            expect(spy).toHaveBeenCalledWith(GameEvents.LimitedGameDone, 4, false);
        });
    });

    describe('emitTime', () => {
        let testRoomId: RoomId;
        let testGameRoom: GameRoom;

        beforeEach(() => {
            testRoomId = {
                gameId: 0,
                roomNumber: 0,
                stringFormat: 'limited' + ' ' + socket.id,
                hostId: socket.id,
            };

            const player: Player = { socketId: '', name: '', differencesFound: [] };
            testGameRoom = {
                roomId: testRoomId,
                host: player,
                guest: player,
                numberDifferences: 0,
                clock: 10,
                gameStarted: false,
                constants: { initialTime: 0, goodGuessTime: 0, hintUsedTime: 5 },
                isLimitedTime: false,
                gameIds: [5],
            };

            jest.spyOn(server, 'to').mockReturnThis();
        });

        it('should call getGameRooms on the game manager', () => {
            const spy = jest.spyOn(gameManager, 'getGameRooms').mockReturnValue([testGameRoom]);

            gateway['emitTime']();
            expect(spy).toHaveBeenCalled();
        });

        describe('gameStarted and isLimitedTime are true on the gameRoom', () => {
            beforeEach(() => {
                jest.spyOn(gameManager, 'getGameRooms').mockReturnValue([testGameRoom]);
                testGameRoom.gameStarted = true;
                testGameRoom.isLimitedTime = true;
            });

            it('should descrement the clock on the gameRoom', () => {
                gateway['emitTime']();
                expect(testGameRoom.clock).toBe(9);
            });
            it('should call checkForLimitedGameEnd on the game manager', () => {
                const spy = jest.spyOn(gameManager, 'checkForLimitedGameEnd');

                gateway['emitTime']();
                expect(spy).toHaveBeenCalledWith(testGameRoom);
            });
            it('should emit timer event if limited game is not finished', () => {
                jest.spyOn(gameManager, 'checkForLimitedGameEnd').mockReturnValue(false);
                const spy = jest.spyOn(server.to('limited ' + socket.id), 'emit');

                gateway['emitTime']();
                expect(spy).toHaveBeenCalledWith(GameEvents.Timer, 9);
            });
            it('should set gameStarted to false on gameRoom', () => {
                jest.spyOn(gameManager, 'checkForLimitedGameEnd').mockReturnValue(true);

                gateway['emitTime']();
                expect(testGameRoom.gameStarted).toBeFalsy();
            });
            it('should call endLimitedGame', () => {
                jest.spyOn(gameManager, 'checkForLimitedGameEnd').mockReturnValue(true);
                const spy = jest.spyOn<any, any>(gateway, 'endLimitedGame');

                gateway['emitTime']();
                expect(spy).toHaveBeenCalledWith(testGameRoom, 0, false);
            });
        });

        it('should emit the timer event if gameStarted is true on the gameRoom', () => {
            jest.spyOn(gameManager, 'getGameRooms').mockReturnValue([testGameRoom]);
            testGameRoom.gameStarted = true;
            const spy = jest.spyOn(server.to('limited ' + socket.id), 'emit');

            gateway['emitTime']();
            expect(spy).toHaveBeenCalledWith(GameEvents.Timer, 10);
        });
        it('should not emit the timer event if gameStarted is false on the gameRoom', () => {
            jest.spyOn(gameManager, 'getGameRooms').mockReturnValue([testGameRoom]);
            const spy = jest.spyOn(server.to('limited ' + socket.id), 'emit');

            gateway['emitTime']();
            expect(spy).not.toHaveBeenCalledWith(GameEvents.Timer, 11);
        });
    });
});
