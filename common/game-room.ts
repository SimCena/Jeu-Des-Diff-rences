import { GameConstantsInput } from './game-constants-input';
import { Player } from './player';
import { RoomId } from './room-id';

export interface GameRoom {
    roomId: RoomId;
    host: Player;
    guest: Player;
    numberDifferences: number;
    clock: number;
    gameStarted: boolean;
    constants: GameConstantsInput;
    isLimitedTime: boolean;
    gameIds: number[];
}
