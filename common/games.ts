import { PlayerRanking } from './player-ranking';

export interface Game {
    id: number;
    name: string;
    url: string;
    solo: Ranking[];
    multiplayer: Ranking[];
    differenceImage: Difference[];
    originalImage: string;
    modifiedImage: string;
}

export interface GameClient {
    id: number;
    name: string;
    url: string;
    solo: Ranking[];
    multiplayer: Ranking[];
    differenceCount: number;
}

export interface Ranking {
    name: string;
    time: number;
}

export interface Images {
    original: number[];
    modified: number[];
    differenceNumber: number;
}

export interface BlinkingImages {
    newOriginal: number[];
    newModified: number[];
    oldOriginal: number[];
}

export interface Difference {
    differenceNumber: number;
    positions: number[];
}

export interface ScoreInfo {
    gameId: number;
    playerName: string;
    winnerName: string;
    formattedTime: string;
    gameName: string;
    playerRanking: PlayerRanking;
    isPlayerWinner: boolean;
}

export interface LimitedScoreInfo {
    playerName: string;
    teammateName: string;
    score: number;
    formattedTime: string;
    timeExpired: boolean;
}

export interface AttemptResponse {
    difference: Difference;
    playerId: string;
}
