import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BackgroundCanvasComponent } from '@app/components/background-canvas/background-canvas.component';
import { CheatingCanvasesComponent } from '@app/components/cheating-canvases/cheating-canvases.component';
import { CSSElement } from '@app/interfaces/css-element';
import { CanvasId } from '@app/models/canvas-id';
import { CheatingModeService } from '@app/services/cheating-mode.service';
import { ClockService } from '@app/services/clock.service';
import { GameHandlerService } from '@app/services/game-handler.service';
import { GameRequestsService } from '@app/services/game-requests.service';
import { MouseHandlerService } from '@app/services/mouse-handler.service';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-base-game-page',
    templateUrl: './base-game-page.component.html',
    styleUrls: ['./base-game-page.component.scss'],
})
export class BaseGamePageComponent implements OnInit, OnDestroy {
    // eslint-disable-next-line max-params
    constructor(
        protected gameHandlerService: GameHandlerService,
        protected clockService: ClockService,
        private socketService: SocketService,
        private gameRequestsService: GameRequestsService,
        private mouseHandlerService: MouseHandlerService,
        private cheatingModeService: CheatingModeService,
    ) {
        this.gameHandlerService.initBooleans();
    }

    @ViewChild('og') set ogCanvas(ogCanvas: BackgroundCanvasComponent) {
        this.gameHandlerService.setCanvas(CanvasId.ORIGINAL, ogCanvas);
    }
    @ViewChild('mod') set modCanvas(modCanvas: BackgroundCanvasComponent) {
        this.gameHandlerService.setCanvas(CanvasId.MODIFIED, modCanvas);
    }
    @ViewChild('ogCheat') set ogCheatCanvas(ogCheatCanvas: CheatingCanvasesComponent) {
        this.cheatingModeService.setCheatingCanvases(CanvasId.ORIGINAL, ogCheatCanvas);
    }
    @ViewChild('modCheat') set modCheatCanvas(modCheatCanvas: CheatingCanvasesComponent) {
        this.cheatingModeService.setCheatingCanvases(CanvasId.MODIFIED, modCheatCanvas);
    }

    ngOnInit(): void {
        if (!this.socketService.isSocketAlive()) {
            this.gameRequestsService.abandonGame();
            return;
        }
        this.gameHandlerService.configureGame();
    }

    ngOnDestroy(): void {
        if (!this.socketService.isSocketAlive()) return;
        this.socketService.unsubscribeBaseSocketFeatures();
        this.clockService.resetTimer();
    }

    protected getCanvasId(): typeof CanvasId {
        return CanvasId;
    }

    protected getErrorMessagePosition(): CSSElement {
        return this.mouseHandlerService.getPositionAsCSS(true);
    }
}
