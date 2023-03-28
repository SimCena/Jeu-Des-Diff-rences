import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DifferenceImageParam } from '@common/difference-image-param';
import { Difference, GameClient } from '@common/games';
import { Message } from '@common/message';
import { GameData } from '@common/game-data';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { GameConstantsInput } from '@common/game-constants-input';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string;

    constructor(private readonly http: HttpClient) {
        this.baseUrl = environment.serverUrl;
    }

    postDifferenceImage(params: DifferenceImageParam): Observable<Difference[]> {
        return this.http
            .post<Difference[]>(`${this.baseUrl}/differenceImage`, params)
            .pipe(catchError(this.handleError<Difference[]>('getDifferenceImage')));
    }

    putGame(params: GameData): Observable<boolean> {
        return this.http.put<boolean>(`${this.baseUrl}/games`, params).pipe(catchError(this.handleError<boolean>('putGame')));
    }

    putGameConstants(gameConstants: GameConstantsInput): Observable<Message> {
        return this.http.put<Message>(`${this.baseUrl}/constants`, gameConstants).pipe(catchError(this.handleError<Message>('putGameConstants')));
    }

    getGames(): Observable<GameClient[]> {
        return this.http.get<GameClient[]>(`${this.baseUrl}/games`).pipe(catchError(this.handleError<GameClient[]>('getGames')));
    }

    getGameConstants(): Observable<GameConstantsInput> {
        return this.http
            .get<GameConstantsInput>(`${this.baseUrl}/constants`)
            .pipe(catchError(this.handleError<GameConstantsInput>('getGameConstants')));
    }

    getDifferencesPositions(id: number): Observable<Difference[]> {
        return this.http.get<Difference[]>(`${this.baseUrl}/games/${id}`).pipe(catchError(this.handleError<Difference[]>('getDifferencesPositions')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
