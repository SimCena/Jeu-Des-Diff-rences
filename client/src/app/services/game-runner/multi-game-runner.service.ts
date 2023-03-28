import { Injectable } from '@angular/core';
import { GameRunner } from '@app/classes/game-runner';
import { LOCAL_PLAYER, OPPONENT_PLAYER } from '@app/constants/game';
import { ClockService } from '@app/services/clock.service';
import { GameHandlerService } from '@app/services/game-handler.service';
import { GameRequestsService } from '@app/services/game-requests.service';
import { MouseHandlerService } from '@app/services/mouse-handler.service';
import { SocketService } from '@app/services/socket.service';
import { EndGameInfo } from '@common/end-game-info';
import { AttemptResponse } from '@common/games';
import { PlayerInfo } from '@common/player-info';
import { PlayerRanking } from '@common/player-ranking';

@Injectable({
    providedIn: 'root',
})
export class MultiGameRunnerService extends GameRunner {
    playerInfos: PlayerInfo[];
    numberDifferencesFound: number[];
    opponentStillThere: boolean;

    // eslint-disable-next-line max-params
    constructor(
        protected socketService: SocketService,
        protected mouseHandlerService: MouseHandlerService,
        protected gameRequestsService: GameRequestsService,
        protected gameHandlerService: GameHandlerService,
        private clockService: ClockService,
    ) {
        super(gameHandlerService);
        this.initBooleans();
        this.initDifferences();
    }

    subscribeOpponentReady(): void {
        this.socketService.subscribeOpponentReady((playerInfo: PlayerInfo) => {
            if (playerInfo.socketId !== this.socketService.getSocketId()) {
                if (this.playerInfos.length < 2) this.playerInfos.push(playerInfo);
                this.gameHandlerService.opponentReady = true;
                if (this.gameHandlerService.playerReady) {
                    this.startGame();
                }
            }
        });
    }

    initSocketSubscriptions(): void {
        if (!this.socketService.isSocketAlive()) return;
        this.subscribeOpponentReady();

        this.socketService.subscribeParticipantLeft((socketId: string) => {
            if (this.playerInfos[OPPONENT_PLAYER].socketId === socketId) {
                this.opponentStillThere = false;
                this.gameHandlerService.endGame(
                    this.gameHandlerService.playerName,
                    { ranking: PlayerRanking.None, time: this.clockService.timer },
                    false,
                );
            }
        });

        this.socketService.subscribeValidation((attemptResponse: AttemptResponse) => {
            this.sendFeedback(attemptResponse);
            this.lockAttempts();
        });

        this.socketService.subscribePlayerWonGame((playerInfo: PlayerInfo, endGameInfo: EndGameInfo) => {
            this.opponentStillThere = false;
            this.gameHandlerService.attemptsEnabled = false;
            this.gameHandlerService.endGame(playerInfo.name, endGameInfo, playerInfo.socketId === this.socketService.getSocketId());
        });

        this.socketService.subscribeGameTied(() => {
            this.gameHandlerService.attemptsEnabled = false;
            this.gameHandlerService.endGame('', { ranking: PlayerRanking.None, time: this.clockService.timer }, false);
        });
        this.subscribeImages();
    }

    subscribeImages(): void {
        this.socketService.subscribeImages(() => {
            this.gameHandlerService.playerReady = true;
            this.socketService.sendPlayerReady({ name: this.gameHandlerService.playerName, socketId: this.socketService.getSocketId() });
            if (this.gameHandlerService.opponentReady) {
                this.startGame();
                this.gameHandlerService.attemptsEnabled = true;
            }
        });
    }

    getPlayerName(): string {
        return this.gameHandlerService.playerName ? this.gameHandlerService.playerName : 'Inconnu';
    }

    getDifferencesFound(playerId: number): string {
        return this.numberDifferencesFound[playerId].toString();
    }

    startGame(): void {
        this.gameHandlerService.gameHasStarted = true;
        this.clockService.startTimer();
        this.socketService.startGame();
    }

    setPlayerInfo(): void {
        this.playerInfos = [];
        this.playerInfos.push({
            name: this.getPlayerName(),
            socketId: this.socketService.getSocketId(),
        });
    }

    configureKeyToggle(): void {
        this.gameHandlerService.isCheatMode = false;
        document.body.onkeydown = (keyPressedEvent: KeyboardEvent): void => {
            this.keyPressed(keyPressedEvent);
        };
    }

    initBooleans(): void {
        this.gameHandlerService.playerReady = false;
        this.gameHandlerService.attemptsEnabled = true;
        this.opponentStillThere = true;
        this.gameHandlerService.opponentReady = false;
    }

    protected initDifferences(): void {
        this.playerInfos = [];
        this.numberDifferencesFound = [0, 0];
    }

    protected giveSuccessFeedback(attemptResponse: AttemptResponse): void {
        this.gameHandlerService.giveSuccessFeedback(attemptResponse);
        this.updateDifferencesFound(attemptResponse);
    }

    protected giveFailFeedback(): void {
        this.gameHandlerService.giveFailFeedback();
    }

    protected updateDifferencesFound(attemptResponse: AttemptResponse): void {
        if (attemptResponse.playerId === this.socketService.getSocketId()) {
            this.numberDifferencesFound[LOCAL_PLAYER]++;
            return;
        }
        this.numberDifferencesFound[OPPONENT_PLAYER]++;
    }

    private keyPressed(keyPressed: KeyboardEvent): void {
        if ((keyPressed.key === 't' || keyPressed.key === 'T') && this.gameHandlerService.gameHasStarted) {
            this.gameHandlerService.isCheatMode = !this.gameHandlerService.isCheatMode;
        }
    }
}
