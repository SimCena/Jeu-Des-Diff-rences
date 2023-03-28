import { Difference } from './games';

export interface GameData {
    gameName: string;
    originalImage: ImageData;
    modifiedImage: ImageData;
    differenceImage: Difference[];
}

export interface GameDataNumbered {
    gameName: string;
    originalImage: number[];
    modifiedImage: number[];
    differenceImage: Difference[];
}
