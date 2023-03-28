import { Injectable } from '@angular/core';
import { GameRunner } from '@app/classes/game-runner';
import { MILLISECONDS_IN_SECOND } from '@app/constants/constants';
import { NameInputValue } from '@app/interfaces/name-input-value';
import { CheatingModeService } from '@app/services/cheating-mode.service';
import { ClockService } from '@app/services/clock.service';
import { GameHandlerService } from '@app/services/game-handler.service';
import { GameRequestsService } from '@app/services/game-requests.service';
import { MouseHandlerService } from '@app/services/mouse-handler.service';
import { SocketService } from '@app/services/socket.service';
import { Authors, SystemMessage } from '@common/chat';
import { EndGameInfo } from '@common/end-game-info';
import { AttemptResponse } from '@common/games';

@Injectable({
    providedIn: 'root',
})
export class SoloGameRunnerService extends GameRunner {
    numberDifferencesFound: number;
    isClueMode: boolean;

    // eslint-disable-next-line max-params
    constructor(
        protected socketService: SocketService,
        protected mouseHandlerService: MouseHandlerService,
        protected gameRequestsService: GameRequestsService,
        protected gameHandlerService: GameHandlerService,
        private clockService: ClockService,
        private cheatingModeService: CheatingModeService,
    ) {
        super(gameHandlerService);
    }

    initSocketSubscriptions(): void {
        if (!this.socketService.isSocketAlive()) return;

        this.socketService.subscribeValidation((attemptResponse: AttemptResponse) => {
            this.sendFeedback(attemptResponse);
            this.lockAttempts();
        });

        this.socketService.subscribeSoloGameWon((endGameInfo: EndGameInfo) => {
            this.gameHandlerService.attemptsEnabled = false;
            this.gameHandlerService.endGame(this.gameHandlerService.playerName, endGameInfo, true);
        });

        this.socketService.subscribeImages(() => {
            this.gameHandlerService.playerReady = true;
            this.clockService.startTimer();
            this.socketService.startGame();
        });
    }

    getPlayerName(): string {
        return this.gameHandlerService.playerName ? this.gameHandlerService.playerName : 'Inconnu';
    }

    getDifferencesMessage(): string {
        return this.numberDifferencesFound.toString();
    }

    sendAttempt(): void {
        this.gameHandlerService.attemptsEnabled = false;
        this.socketService.validateAttempt({
            coords: this.mouseHandlerService.relativePosition,
            currentGameId: this.gameRequestsService.currentGameId,
        });
    }

    validateNameInput(nameInputValue: NameInputValue): void {
        if (nameInputValue?.confirmed) {
            this.gameHandlerService.playerName = nameInputValue.name;
            this.startGame();
            this.socketService.sendPlayerName(nameInputValue.name);
            return;
        }
        this.gameRequestsService.abandonGame();
    }

    configureKeyToggles(): void {
        this.isClueMode = false;
        this.gameHandlerService.isCheatMode = false;
        document.body.onkeydown = (keyPressedEvent: KeyboardEvent): void => {
            this.keyPressed(keyPressedEvent);
        };
    }

    activateClue(isLimitedTime: boolean): void {
        if (this.cheatingModeService.cluesLeft > 0 && !this.isClueMode) {
            this.isClueMode = true;
            this.cheatingModeService.getClue();
            this.socketService.sendMessage({
                author: Authors.System,
                socketId: this.socketService.getSocketId(),
                body: SystemMessage.Clue,
            });
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            this.clockService.alterTimer(
                isLimitedTime ? -this.gameHandlerService.gameConstants.hintUsedTime : this.gameHandlerService.gameConstants.hintUsedTime,
            );
            this.socketService.clueUsed();
            setTimeout(() => {
                this.isClueMode = false;
            }, 2 * MILLISECONDS_IN_SECOND);
        }
    }

    initBooleans(): void {
        this.gameHandlerService.playerReady = false;
        this.gameHandlerService.gameHasStarted = true;
        this.gameHandlerService.attemptsEnabled = true;
        this.isClueMode = false;
    }

    protected initDifferences(): void {
        this.numberDifferencesFound = 0;
    }

    protected giveSuccessFeedback(attemptResponse: AttemptResponse): void {
        this.gameHandlerService.giveSuccessFeedback(attemptResponse);
        this.updateDifferencesFound();
    }

    protected giveFailFeedback(): void {
        this.gameHandlerService.giveFailFeedback();
    }

    protected updateDifferencesFound(): void {
        this.numberDifferencesFound++;
    }

    private startGame(): void {
        this.clockService.startTimer();
        this.clockService.timer = 0;
        this.gameHandlerService.gameHasStarted = true;
    }

    private keyPressed(keyPressed: KeyboardEvent): void {
        if (this.gameHandlerService.gameHasStarted && this.gameHandlerService.playerReady) {
            if ((keyPressed.key === 'i' || keyPressed.key === 'I') && !this.isClueMode) {
                this.activateClue(false);
            }
            if (keyPressed.key === 't' || keyPressed.key === 'T') {
                this.gameHandlerService.isCheatMode = !this.gameHandlerService.isCheatMode;
            }
        }
    }
}
