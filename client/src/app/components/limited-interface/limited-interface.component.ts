import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CanvasId } from '@app/models/canvas-id';
import { CheatingModeService } from '@app/services/cheating-mode.service';
import { GameHandlerService } from '@app/services/game-handler.service';
import { LimitedGameRunnerService } from '@app/services/game-runner/limited-game-runner.service';
import { CheatingCanvasesComponent } from '@app/components/cheating-canvases/cheating-canvases.component';
import { SocketService } from '@app/services/socket.service';
import { SoloGameRunnerService } from '@app/services/game-runner/solo-game-runner.service';
import { MultiGameRunnerService } from '@app/services/game-runner/multi-game-runner.service';

@Component({
    selector: 'app-limited-interface',
    templateUrl: './limited-interface.component.html',
    styleUrls: ['./limited-interface.component.scss'],
})
export class LimitedInterfaceComponent implements OnInit, OnDestroy {
    // eslint-disable-next-line max-params
    constructor(
        protected limitedGameRunnerService: LimitedGameRunnerService,
        protected soloGameRunnerService: SoloGameRunnerService,
        protected multiGameRunnerService: MultiGameRunnerService,
        protected gameHandlerService: GameHandlerService,
        protected cheatingModeService: CheatingModeService,
        private socketService: SocketService,
    ) {
        this.gameHandlerService.gameHasStarted = false;
    }

    @ViewChild('ogClue') set ogClueCanvas(ogClueCanvas: CheatingCanvasesComponent) {
        this.cheatingModeService.setClueCanvases(CanvasId.ORIGINAL, ogClueCanvas);
    }
    @ViewChild('modClue') set modClueCanvas(modClueCanvas: CheatingCanvasesComponent) {
        this.cheatingModeService.setClueCanvases(CanvasId.MODIFIED, modClueCanvas);
    }

    ngOnInit(): void {
        if (!this.socketService.isSocketAlive()) return;
        this.limitedGameRunnerService.initSocketSubscriptions();
        this.limitedGameRunnerService.initGame();
        this.limitedGameRunnerService.configureKeyToggles();
        this.multiGameRunnerService.setPlayerInfo();
    }

    ngOnDestroy(): void {
        if (!this.socketService.isSocketAlive()) return;
        this.socketService.unsubscribeGameSocketFeatures();
        this.socketService.unsubscribeLimitedGameEvents();
        if (this.limitedGameRunnerService.isSolo()) {
            this.socketService.deleteSoloGame();
            return;
        }
        this.socketService.abandonLimitedGameRoom();
    }
}
