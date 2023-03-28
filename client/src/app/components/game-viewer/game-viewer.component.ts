import { Component, OnDestroy, OnInit } from '@angular/core';
import { GAMES_PER_PAGE } from '@app/constants/game';
import { GameRequestsService } from '@app/services/game-requests.service';
import { SocketService } from '@app/services/socket.service';
import { GameClient } from '@common/games';

@Component({
    selector: 'app-game-viewer',
    templateUrl: './game-viewer.component.html',
    styleUrls: ['./game-viewer.component.scss'],
})
export class GameViewerComponent implements OnInit, OnDestroy {
    protected firstGameID: number;
    protected games: GameClient[];

    constructor(public gameRequestService: GameRequestsService, protected socketService: SocketService) {
        this.firstGameID = 0;
        this.games = [];
    }

    ngOnInit(): void {
        this.gameRequestService.gamesReceived = false;
        this.gameRequestService.getGames();
        this.configureSubscriptions();
    }

    ngOnDestroy(): void {
        this.socketService.unsubscribeGameViewerUpdates();
    }

    protected goForward(): void {
        this.firstGameID += GAMES_PER_PAGE;
    }

    protected goBackward(): void {
        this.firstGameID -= GAMES_PER_PAGE;
    }

    protected hasGameBefore(): boolean {
        if (this.gameRequestService.hasGames()) {
            return !!this.gameRequestService.games[this.firstGameID - GAMES_PER_PAGE];
        }
        return false;
    }

    protected hasGameAfter(): boolean {
        if (this.gameRequestService.hasGames()) {
            return !!this.gameRequestService.games[this.firstGameID + GAMES_PER_PAGE];
        }
        return false;
    }

    private configureSubscriptions(): void {
        this.socketService.subscribeModifiedDatabase(() => {
            this.gameRequestService.getGames();
        });
    }
}
