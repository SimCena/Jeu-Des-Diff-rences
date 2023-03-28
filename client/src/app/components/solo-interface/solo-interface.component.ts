import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NameInputValue } from '@app/interfaces/name-input-value';
import { SocketService } from '@app/services/socket.service';
import { NameInputDialogComponent } from '@app/components/name-input-dialog/name-input-dialog.component';
import { GameHandlerService } from '@app/services/game-handler.service';
import { SoloGameRunnerService } from '@app/services/game-runner/solo-game-runner.service';
import { CheatingModeService } from '@app/services/cheating-mode.service';
import { CanvasId } from '@app/models/canvas-id';
import { CheatingCanvasesComponent } from '@app/components/cheating-canvases/cheating-canvases.component';

@Component({
    selector: 'app-solo-interface',
    templateUrl: './solo-interface.component.html',
    styleUrls: ['./solo-interface.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SoloInterfaceComponent implements OnInit, AfterViewInit, OnDestroy {
    // eslint-disable-next-line max-params
    constructor(
        protected gameRunnerService: SoloGameRunnerService,
        protected gameHandlerService: GameHandlerService,
        protected cheatingModeService: CheatingModeService,
        private socketService: SocketService,
        private dialog: MatDialog,
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
        this.gameRunnerService.initSocketSubscriptions();
        this.gameRunnerService.initGame();
        this.gameRunnerService.configureKeyToggles();
    }

    ngAfterViewInit(): void {
        this.gameHandlerService.gameHasStarted = false;
        this.initPlayerName();
    }

    ngOnDestroy(): void {
        if (!this.socketService.isSocketAlive()) return;
        this.socketService.deleteSoloGame();
        this.socketService.unsubscribeGameSocketFeatures();
    }

    private initPlayerName(): void {
        if (!this.socketService.isSocketAlive()) return;
        this.dialog
            .open(NameInputDialogComponent)
            .beforeClosed()
            .subscribe((nameInputValue: NameInputValue) => {
                this.gameRunnerService.validateNameInput(nameInputValue);
            });
    }
}
