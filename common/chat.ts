export enum Authors {
    System = 'Système',
}

export enum SystemMessage {
    DifferenceFound = 'Différence trouvée',
    Error = 'Erreur',
    Abandon = ' a abandonné la partie',
    Clue = 'Indice utilisé',
}

export interface Chat {
    time?: string;
    author: Authors | string;
    socketId: string;
    body: string;
}
