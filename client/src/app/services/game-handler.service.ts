import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BackgroundCanvasComponent } from '@app/components/background-canvas/background-canvas.component';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { CongratulationsDialogComponent } from '@app/components/congratulations-dialog/congratulations-dialog.component';
import { MILLISECONDS_IN_SECOND } from '@app/constants/constants';
import { BLINKING_DELAY, NUMBER_OF_BLINKS } from '@app/constants/game';
import { ActionType } from '@app/models/action-type';
import { CanvasId } from '@app/models/canvas-id';
import { ClockService } from '@app/services/clock.service';
import { GameRequestsService } from '@app/services/game-requests.service';
import { MouseHandlerService } from '@app/services/mouse-handler.service';
import { SocketService } from '@app/services/socket.service';
import { Authors, SystemMessage } from '@common/chat';
import { BAN, DARE } from '@common/constants/easter';
import { BYTES_PER_RGBA_VALUE } from '@common/constants/image';
import { GameConstantsInput } from '@common/game-constants-input';
import { AttemptResponse, BlinkingImages, GameClient, Images, ScoreInfo } from '@common/games';
import { CheatingModeService } from './cheating-mode.service';
import { CommunicationService } from './communication.service';
import { EndGameInfo } from '@common/end-game-info';

@Injectable({
    providedIn: 'root',
})
export class GameHandlerService {
    game: GameClient;
    isErrorMsgHidden: boolean;
    isCheatMode: boolean;
    gameHasStarted: boolean;
    playerReady: boolean;
    opponentReady: boolean;
    playerName: string;
    attemptsEnabled: boolean;
    isBlinking: boolean;
    isLimited: boolean;

    originalCanvas: BackgroundCanvasComponent;
    modifiedCanvas: BackgroundCanvasComponent;
    gameConstants: GameConstantsInput;

    // eslint-disable-next-line max-params
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private socketService: SocketService,
        private cheatingModeService: CheatingModeService,
        private mouseHandlerService: MouseHandlerService,
        private gameRequestsService: GameRequestsService,
        private clockService: ClockService,
        private communicationService: CommunicationService,
    ) {
        this.initBooleans();
    }

    configureGame(): void {
        this.configureImages();
        this.socketService.createNewGame(this.gameRequestsService.currentGameId);
        this.initGame();
        this.isCheatMode = false;
    }

    setCanvas(canvasId: CanvasId, canvas: BackgroundCanvasComponent): void {
        if (canvasId === CanvasId.ORIGINAL) {
            this.originalCanvas = canvas;
        } else if (canvasId === CanvasId.MODIFIED) {
            this.modifiedCanvas = canvas;
        }
    }

    initBooleans(): void {
        this.gameHasStarted = false;
        this.isErrorMsgHidden = true;
        this.isCheatMode = false;
        this.isBlinking = false;
        this.isLimited = false;
    }

    initGameConstants(): void {
        this.communicationService.getGameConstants().subscribe((constants) => {
            this.gameConstants = constants;
        });
    }

    getGameName(): string {
        return this.game ? this.game.name : 'Inconnu';
    }

    getDifferenceImageCount(): string {
        return this.game ? this.game.differenceCount.toString() : '';
    }

    endGame(winnerName: string, endGameInfo: EndGameInfo, isPlayerWinner: boolean): void {
        this.isCheatMode = false;
        this.congratulatePlayer(winnerName, endGameInfo, isPlayerWinner);
        this.clockService.stopTimer();
    }

    giveSuccessFeedback(attemptResponse: AttemptResponse): void {
        new Audio('./assets/sound/success-chime.mp3').play();
        this.cheatingModeService.updateDifferences(attemptResponse.difference.differenceNumber);
        this.findNewModifiedImage(attemptResponse.difference.positions);
    }

    giveFailFeedback(): void {
        new Audio('./assets/sound/fail-chime.mp3').play();
        this.displayErrorMessageOneSecond();
    }

    guessDifference(original: boolean, mouseEvent: MouseEvent): void {
        if (!this.attemptsEnabled) return;
        this.mouseHandlerService.update(mouseEvent, original ? this.originalCanvas.getCanvasElement() : this.modifiedCanvas.getCanvasElement());
        this.sendAttempt();
    }

    confirmAbandon(): void {
        this.dialog
            .open(ConfirmationDialogComponent, { data: ActionType.Abandon, width: '350px' })
            .afterClosed()
            .subscribe((confirmedAbandon: boolean) => {
                if (confirmedAbandon) {
                    this.socketService.sendMessage({
                        author: Authors.System,
                        socketId: this.socketService.getSocketId(),
                        body: this.playerName + SystemMessage.Abandon,
                    });
                    this.gameRequestsService.abandonGame();
                }
            });
    }

    findNewModifiedImage(positions: number[]): void {
        const currentOriginalImage: number[] = Object.values(this.originalCanvas.getImageData().data);
        const newOriginalImage: number[] = [...currentOriginalImage];
        const newModifiedImage: number[] = Object.values(this.modifiedCanvas.getImageData().data);
        positions.forEach((position) => {
            this.setRGBAValues(position * BYTES_PER_RGBA_VALUE, newOriginalImage, newModifiedImage);
            this.setRGBAValues(position * BYTES_PER_RGBA_VALUE, newModifiedImage, currentOriginalImage);
        });
        this.blinkImages({ newOriginal: newOriginalImage, newModified: newModifiedImage, oldOriginal: currentOriginalImage });
    }

    changeBlinking(): void {
        if (!this.isLimited) this.isLimited = true;
        this.isBlinking = !this.isBlinking;
    }

    // EASTER EGG
    threatenBan(message?: string) {
        this.dialog.open(CongratulationsDialogComponent, {
            width: '500px',
            data: {
                gameId: this.game.id,
                gameName: this.game.name,
                playerName: this.playerName,
                winnerName: message ? message : DARE,
                formattedTime: BAN,
            } as ScoreInfo,
        });
    }

    private initGame(): void {
        this.initGameId();
        this.initGameClient();
        this.cheatingModeService.initClues();
        this.initGameConstants();
        this.cheatingModeService.getDifferencesPositions();
    }

    private displayErrorMessageOneSecond(): void {
        this.isErrorMsgHidden = false;
        setTimeout(() => {
            this.isErrorMsgHidden = true;
        }, MILLISECONDS_IN_SECOND);
    }

    private sendAttempt(): void {
        this.attemptsEnabled = false;
        this.socketService.validateAttempt({
            coords: this.mouseHandlerService.relativePosition,
            currentGameId: this.gameRequestsService.currentGameId,
        });
    }

    private initGameId(): void {
        const urlId = this.route.snapshot.queryParamMap.get('id');

        if (!this.gameRequestsService.currentGameId && urlId) {
            this.gameRequestsService.currentGameId = parseInt(urlId, 10);
        }
    }

    private initGameClient(): void {
        if (this.gameRequestsService.hasGames()) {
            this.game = this.gameRequestsService.getGame();
            return;
        }
        this.gameRequestsService.gameSubject.subscribe(() => {
            this.game = this.gameRequestsService.getGame();
        });
    }

    private configureImages(): void {
        this.socketService.subscribeImages((images: Images) => {
            this.originalCanvas?.drawOnCanvasNumberArray(images.original);
            this.modifiedCanvas?.drawOnCanvasNumberArray(images.modified);
        });
    }

    private congratulatePlayer(winnerName: string, endGameInfo: EndGameInfo, isPlayerWinner: boolean): void {
        this.dialog
            .open(CongratulationsDialogComponent, {
                width: '500px',
                data: {
                    gameId: this.game.id,
                    gameName: this.game.name,
                    playerName: this.playerName,
                    winnerName: winnerName ? winnerName : 'Aucun gagnant',
                    formattedTime: this.clockService.getFormattedTime(endGameInfo.time),
                    playerRanking: endGameInfo.ranking,
                    isPlayerWinner,
                } as ScoreInfo,
            })
            .afterClosed()
            .subscribe(() => {
                this.router.navigate(['home']);
            });
    }

    private setRGBAValues(position: number, imageCopy: number[], imageToCopy: number[]): void {
        for (let i = 0; i < BYTES_PER_RGBA_VALUE; i++) {
            imageCopy[position + i] = imageToCopy[position + i];
        }
    }

    private blinkImages(blinkingImages: BlinkingImages): void {
        const currentModifiedImage = this.modifiedCanvas.getImageData();
        this.recursiveBlink(blinkingImages, currentModifiedImage, 0);
    }

    private recursiveBlink(blinkingImages: BlinkingImages, modifiedImage: ImageData, numberOfBlinks: number): void {
        if (this.isLimited && !this.isBlinking) return;
        if (!this.isLimited && numberOfBlinks >= NUMBER_OF_BLINKS) {
            this.modifiedCanvas.drawOnCanvasNumberArray(blinkingImages.newModified);
            this.originalCanvas.drawOnCanvasNumberArray(blinkingImages.oldOriginal);
            return;
        }
        setTimeout(() => {
            if (numberOfBlinks % 2 === 0) {
                this.originalCanvas.drawOnCanvasNumberArray(blinkingImages.newOriginal);
                this.modifiedCanvas.drawOnCanvasImageData(modifiedImage);
                this.recursiveBlink(blinkingImages, modifiedImage, ++numberOfBlinks);
            } else {
                this.originalCanvas.drawOnCanvasNumberArray(blinkingImages.oldOriginal);
                this.modifiedCanvas.drawOnCanvasNumberArray(blinkingImages.newModified);
                this.recursiveBlink(blinkingImages, modifiedImage, ++numberOfBlinks);
            }
        }, BLINKING_DELAY);
    }
}
