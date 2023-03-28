import { Injectable } from '@angular/core';
import { MILLISECONDS_IN_SECOND } from '@app/constants/constants';
import { GameHandlerService } from '@app/services/game-handler.service';
import { AttemptResponse } from '@common/games';

@Injectable({
    providedIn: 'root',
})
export abstract class GameRunner {
    opponentName: string;

    constructor(protected gameHandlerService: GameHandlerService) {}

    initGame(): void {
        this.initBooleans();
        this.initDifferences();
    }

    protected sendFeedback(attemptResponse: AttemptResponse): void {
        if (!attemptResponse.difference) {
            this.giveFailFeedback();
            return;
        }
        this.giveSuccessFeedback(attemptResponse);
    }

    protected lockAttempts(): void {
        setTimeout(() => {
            this.gameHandlerService.attemptsEnabled = true;
        }, MILLISECONDS_IN_SECOND);
    }

    abstract initSocketSubscriptions(): void;

    protected abstract initBooleans(): void;
    protected abstract initDifferences(): void;

    protected abstract giveSuccessFeedback(attemptResponse: AttemptResponse): void;
    protected abstract giveFailFeedback(): void;

    protected abstract updateDifferencesFound(attemptResponse: AttemptResponse): void;
}
