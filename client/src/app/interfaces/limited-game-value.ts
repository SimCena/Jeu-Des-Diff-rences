export enum LimitedGameChoice {
    Solo,
    Coop,
    Cancel,
}

export interface LimitedGameValue {
    name: string;
    choice: LimitedGameChoice;
}
