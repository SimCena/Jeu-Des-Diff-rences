import { Component, OnDestroy, OnInit } from '@angular/core';
import { LOCAL_PLAYER, OPPONENT_PLAYER } from '@app/constants/game';
import { SocketService } from '@app/services/socket.service';
import { GameHandlerService } from '@app/services/game-handler.service';
import { MultiGameRunnerService } from '@app/services/game-runner/multi-game-runner.service';

@Component({
    selector: 'app-multiplayer-interface',
    templateUrl: './multiplayer-interface.component.html',
    styleUrls: ['./multiplayer-interface.component.scss'],
})
export class MultiplayerInterfaceComponent implements OnInit, OnDestroy {
    protected readonly localIndex;
    protected readonly opponentIndex;

    // eslint-disable-next-line max-params
    constructor(
        protected gameHandlerService: GameHandlerService,
        protected gameRunnerService: MultiGameRunnerService,
        private socketService: SocketService,
    ) {
        this.localIndex = LOCAL_PLAYER;
        this.opponentIndex = OPPONENT_PLAYER;
        this.gameHandlerService.gameHasStarted = false;
    }

    ngOnInit() {
        if (!this.socketService.isSocketAlive()) return;
        this.gameRunnerService.initSocketSubscriptions();
        this.gameRunnerService.initGame();
        this.gameRunnerService.configureKeyToggle();
        this.gameRunnerService.setPlayerInfo();
    }

    ngOnDestroy(): void {
        if (this.socketService.isSocketAlive()) {
            if (this.gameRunnerService.opponentStillThere) {
                this.socketService.abandonMultiplayerRoom();
            } else {
                this.socketService.leaveGameRoom();
            }
            this.socketService.unsubscribeOpponentName();
            this.socketService.unsubscribeGameSocketFeatures();
        }
    }
}
