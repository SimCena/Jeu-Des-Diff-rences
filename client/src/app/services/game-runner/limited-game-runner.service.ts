/* eslint-disable max-params */
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameRunner } from '@app/classes/game-runner';
import { CongratulationsDialogLimitedComponent } from '@app/components/congratulations-dialog-limited/congratulations-dialog-limited.component';
import { LimitedGameChoice } from '@app/interfaces/limited-game-value';
import { CheatingModeService } from '@app/services/cheating-mode.service';
import { ClockService } from '@app/services/clock.service';
import { GameHandlerService } from '@app/services/game-handler.service';
import { GameRequestsService } from '@app/services/game-requests.service';
import { SocketService } from '@app/services/socket.service';
import { AttemptResponse, LimitedScoreInfo } from '@common/games';
import { PlayerInfo } from '@common/player-info';
import { MultiGameRunnerService } from './multi-game-runner.service';
import { SoloGameRunnerService } from './solo-game-runner.service';

@Injectable({
    providedIn: 'root',
})
export class LimitedGameRunnerService extends GameRunner {
    playerInfos: PlayerInfo[];
    numberDifferencesFound: number;
    isClueMode: boolean;
    gameType: LimitedGameChoice;

    // eslint-disable-next-line max-params
    constructor(
        protected gameHandlerService: GameHandlerService,
        private cheatingModeService: CheatingModeService,
        private clockService: ClockService,
        private socketService: SocketService,
        private gameRequestsService: GameRequestsService,
        private multiGameRunnerService: MultiGameRunnerService,
        private soloGameRunnerService: SoloGameRunnerService,
        private router: Router,
        private dialog: MatDialog,
    ) {
        super(gameHandlerService);
    }

    initSocketSubscriptions(): void {
        if (!this.socketService.isSocketAlive()) return;

        this.socketService.subscribeValidation((attemptResponse: AttemptResponse) => {
            this.sendFeedback(attemptResponse);
            this.lockAttempts();
        });

        this.socketService.subscribeChangeGame((gameId: number) => {
            this.clockService.stopTimer();
            this.socketService.pauseTimer();
            this.gameHandlerService.changeBlinking();
            this.gameRequestsService.currentGameId = gameId;
            this.socketService.createNewGame(gameId);
            this.cheatingModeService.getDifferencesPositions();
        });

        this.socketService.subscribeLimitedGameDone((score: number, isMaxScore: boolean) => {
            if (!isMaxScore) this.clockService.resetTimer();
            this.endLimitedGame(score, !isMaxScore);
            if (!this.isSolo()) this.socketService.leaveGameRoom();
        });

        this.multiGameRunnerService.subscribeOpponentReady();

        this.socketService.subscribeParticipantLeft((socketId: string) => {
            if (this.socketService.getSocketId() !== socketId) {
                this.multiGameRunnerService.playerInfos.pop();
                this.gameType = LimitedGameChoice.Solo;
            }
        });

        this.multiGameRunnerService.subscribeImages();
    }

    configureKeyToggles(): void {
        this.isClueMode = false;
        this.gameHandlerService.isCheatMode = false;
        document.body.onkeydown = (keyPressedEvent: KeyboardEvent): void => {
            this.keyPressed(keyPressedEvent);
        };
    }

    isSolo(): boolean {
        return this.gameType === LimitedGameChoice.Solo;
    }

    protected initBooleans(): void {
        if (this.isSolo()) {
            this.soloGameRunnerService.initBooleans();
            this.gameHandlerService.opponentReady = true;
            return;
        }
        this.multiGameRunnerService.initBooleans();
        this.gameHandlerService.opponentReady = false;
    }

    protected initDifferences(): void {
        this.playerInfos = [];
        this.numberDifferencesFound = 0;
    }

    protected giveSuccessFeedback(attemptResponse: AttemptResponse): void {
        this.gameHandlerService.attemptsEnabled = false;
        new Audio('./assets/sound/success-chime.mp3').play();
        this.gameHandlerService.changeBlinking();
        this.gameHandlerService.findNewModifiedImage(attemptResponse.difference.positions);
        this.updateDifferencesFound();
    }

    protected giveFailFeedback(): void {
        this.gameHandlerService.giveFailFeedback();
    }

    protected updateDifferencesFound(): void {
        this.numberDifferencesFound++;
    }

    private endLimitedGame(score: number, timeExpired: boolean): void {
        this.gameHandlerService.isCheatMode = false;
        this.gameHandlerService.isLimited = false;
        this.clockService.stopTimer();
        this.congratulateLimitedPlayer(score, timeExpired);
    }

    private congratulateLimitedPlayer(score: number, timeExpired: boolean): void {
        this.dialog
            .open(CongratulationsDialogLimitedComponent, {
                width: '500px',
                data: {
                    playerName: this.gameHandlerService.playerName,
                    teammateName: this.multiGameRunnerService.playerInfos[1] ? this.multiGameRunnerService.playerInfos[1].name : '',
                    score,
                    formattedTime: this.clockService.getFormattedTime(),
                    timeExpired,
                } as LimitedScoreInfo,
            })
            .afterClosed()
            .subscribe(() => {
                this.router.navigate(['home']);
            });
    }

    private keyPressed(keyPressed: KeyboardEvent): void {
        if (this.gameHandlerService.gameHasStarted && this.gameHandlerService.playerReady) {
            if ((keyPressed.key === 'i' || keyPressed.key === 'I') && !this.isClueMode && this.gameType === LimitedGameChoice.Solo) {
                this.soloGameRunnerService.activateClue(true);
            }
            if (keyPressed.key === 't' || keyPressed.key === 'T') {
                this.gameHandlerService.isCheatMode = !this.gameHandlerService.isCheatMode;
            }
        }
    }
}
