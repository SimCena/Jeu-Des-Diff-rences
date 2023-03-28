import { GameConstantsGroup } from '@app/interfaces/game-constants-group';
import { GameConstantsInput } from '@common/game-constants-input';

export const GAMES_PER_PAGE = 4;
export const MIN_DIFFERENCE_COUNT = 3;
export const MAX_DIFFERENCE_COUNT = 9;
export const BLINKING_DELAY = 100;
export const NUMBER_OF_BLINKS = 6;
export const MAX_NAME_LENGTH = 15;
export const MAX_GAME_NAME_LENGTH = 30;
export const DEFAULT_DIFFERENCE_RADIUS = 3;
export const DEFAULT_TOOL_WIDTH = 10;
export const MAX_MESSAGE_LENGTH = 200;
export const LOCAL_PLAYER = 0;
export const OPPONENT_PLAYER = 1;

export const INITIAL_TIME_CONSTANTS: GameConstantsGroup = {
    default: 30,
    min: 10,
    max: 60,
};

export const GOOD_GUESS_CONSTANTS: GameConstantsGroup = {
    default: 5,
    min: 0,
    max: 20,
};

export const BAD_GUESS_CONSTANTS: GameConstantsGroup = {
    default: 5,
    min: 0,
    max: 20,
};

export const DEFAULT_GAME_CONSTANTS: GameConstantsInput = {
    initialTime: 30,
    goodGuessTime: 5,
    hintUsedTime: 5,
};
