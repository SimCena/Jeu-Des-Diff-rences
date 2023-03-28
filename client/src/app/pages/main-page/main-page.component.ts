import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LimitedGameDialogComponent } from '@app/components/limited-game-dialog/limited-game-dialog.component';
import { LOGO_ROTATION_SCALING_FACTOR } from '@app/constants/constants';
import { LimitedGameChoice, LimitedGameValue } from '@app/interfaces/limited-game-value';
import { DarkModeService } from '@app/services/dark-mode.service';
import { GameHandlerService } from '@app/services/game-handler.service';
import { GameRequestsService } from '@app/services/game-requests.service';
import { LimitedGameRunnerService } from '@app/services/game-runner/limited-game-runner.service';
import { SocketService } from '@app/services/socket.service';
import { Coordinate } from '@common/coordinate';
import { ThMesh } from 'ngx-three';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements AfterViewInit, OnInit {
    @ViewChild('TitleMesh', { static: true }) private titleMesh: ThMesh;

    private currentMousePosition: Coordinate;
    private windowWidth: number;
    private windowHeight: number;

    // eslint-disable-next-line max-params
    constructor(
        public darkModeService: DarkModeService,
        private gameRequestsService: GameRequestsService,
        private limitedGameRunnerService: LimitedGameRunnerService,
        private socketService: SocketService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private gameHandler: GameHandlerService,
    ) {}

    ngOnInit(): void {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }
        this.configureModifiedDatabase();
    }

    ngAfterViewInit(): void {
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
    }

    protected selectLimitedGame(): void {
        this.dialog
            .open(LimitedGameDialogComponent)
            .beforeClosed()
            .subscribe((limitedGameValue: LimitedGameValue) => {
                if (limitedGameValue.name) this.gameHandler.playerName = limitedGameValue.name;
                switch (limitedGameValue.choice) {
                    case LimitedGameChoice.Solo:
                        this.startSoloLimitedGame();
                        break;
                    case LimitedGameChoice.Coop:
                        this.startCoopLimitedGame();
                        break;
                    default:
                        break;
                }
            });
    }

    protected mouseMove(event: MouseEvent): void {
        this.currentMousePosition = { x: event.x, y: event.y };
        this.rotateTitle();
    }

    private startSoloLimitedGame(): void {
        if (!this.gameRequestsService.hasGames()) {
            this.snackBar.open('Erreur 404 - Aucun jeu trouvé', undefined, { duration: 3500 });
            return;
        }
        this.socketService.createSoloGame(this.gameRequestsService.games[0].id);
        this.socketService.subscribeLimitedGameId((gameId: number) => {
            this.gameRequestsService.launchGame(gameId, true);
        });
        this.socketService.setLimitedGameMode();
        this.limitedGameRunnerService.gameType = LimitedGameChoice.Solo;
    }

    private startCoopLimitedGame(): void {
        if (!this.gameRequestsService.hasGames()) {
            this.snackBar.open('Erreur 404 - Aucun jeu trouvé', undefined, { duration: 3500 });
            return;
        }
        this.socketService.subscribeLimitedGameId((gameId: number) => {
            this.gameRequestsService.launchLimitedWaitingRoom(gameId);
        });
        this.socketService.subscribeRoomJoined(() => {
            this.gameRequestsService.launchMultiplayerGame(true);
        });
        this.socketService.joinLimitedRoom(this.gameHandler.playerName);
        this.limitedGameRunnerService.gameType = LimitedGameChoice.Coop;
    }

    private configureModifiedDatabase(): void {
        this.socketService.subscribeModifiedDatabase(() => {
            this.gameRequestsService.getGames();
        });
    }

    private rotateTitle(): void {
        this.titleMesh.rotation = this.getRotation(1);
    }

    private getRotation(factor: number): [x: number, y: number, z: number] {
        const rotation: Coordinate = this.scaleRotation(this.normalizeRotation(this.getCenterRelativePosition(this.currentMousePosition), factor));
        return [rotation.y, rotation.x, 0];
    }

    private scaleRotation(rotation: Coordinate): Coordinate {
        return {
            x: rotation.x / LOGO_ROTATION_SCALING_FACTOR,
            y: rotation.y / LOGO_ROTATION_SCALING_FACTOR,
        };
    }

    private normalizeRotation(position: Coordinate, factor: number): Coordinate {
        return {
            x: (factor * position.x) / (this.windowWidth / 2),
            y: (factor * position.y) / (this.windowHeight / 2),
        };
    }

    private getCenterRelativePosition(position: Coordinate): Coordinate {
        position.x = position.x - this.windowWidth / 2;
        position.y = position.y - this.windowHeight / 2;

        return position;
    }
}
