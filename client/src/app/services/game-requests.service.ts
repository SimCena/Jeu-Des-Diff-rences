import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GameClient } from '@common/games';
import { Subject } from 'rxjs';
import { CommunicationService } from './communication.service';

@Injectable({
    providedIn: 'root',
})
export class GameRequestsService {
    games: GameClient[];
    currentGameId: number;
    gameSubject: Subject<boolean>;
    isHost: boolean;
    gamesReceived: boolean;

    constructor(private communicationService: CommunicationService, private router: Router) {
        this.gameSubject = new Subject();
        this.getGames();
        this.gamesReceived = true;
    }

    getGames(): void {
        this.communicationService.getGames().subscribe((games: GameClient[]) => {
            if (games !== undefined) {
                this.games = Object.values(games);
                this.gameSubject.next(true);
            }
            this.gamesReceived = games !== undefined;
            this.gameSubject.next(false);
        });
    }

    getGame(): GameClient {
        return this.games[this.getGamePosition(this.currentGameId)];
    }

    getGamePosition(id: number): number {
        return this.games.findIndex((gameElement) => gameElement.id === id);
    }

    getGameUrl(id: number): string {
        let url = '';
        this.games.forEach((game) => {
            if (game.id === id) {
                url = game.url;
                return;
            }
        });
        return url;
    }

    hasGames(): boolean {
        if (this.games) {
            if (this.games.length > 0) {
                return true;
            }
        }
        return false;
    }

    returnToSelect(): void {
        this.router.navigate(['select']);
    }

    abandonGame(): void {
        this.router.navigate(['home']);
    }

    launchGame(id: number, limited?: boolean): void {
        this.currentGameId = id;
        if (limited) {
            this.router.navigate(['play', 'limited'], { queryParams: { id } });
            return;
        }
        this.router.navigate(['play', 'classic', 'solo'], { queryParams: { id } });
    }

    launchMultiplayerWaitingRoom(id: number): void {
        this.currentGameId = id;
        this.router.navigate(['waiting', 'classic'], { queryParams: { id } });
    }

    launchLimitedWaitingRoom(id: number): void {
        this.currentGameId = id;
        this.router.navigate(['waiting', 'limited'], { queryParams: { id } });
    }

    launchMultiplayerGame(limited?: boolean): void {
        if (limited) {
            this.router.navigate(['play', 'limited'], { queryParams: { id: this.currentGameId } });
            return;
        }
        this.router.navigate(['play', 'classic', 'multi'], { queryParams: { id: this.currentGameId } });
    }
}
