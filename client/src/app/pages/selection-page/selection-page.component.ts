import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-selection-page',
    templateUrl: './selection-page.component.html',
    styleUrls: ['./selection-page.component.scss'],
})
export class SelectionPageComponent implements OnInit, OnDestroy {
    constructor(private socketService: SocketService) {}

    ngOnInit(): void {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }
        this.socketService.roomsReceived = false;
        this.socketService.joinRoom('select');
        this.socketService.requestActiveRooms();
    }

    ngOnDestroy(): void {
        this.socketService.leaveRoom('select');
    }
}
