import { Injectable } from '@angular/core';
import { MAX_TIMER_TIME, SECONDS_PER_MINUTE } from '@app/constants/constants';
import { SocketService } from './socket.service';

@Injectable({
    providedIn: 'root',
})
export class ClockService {
    timer: number;

    constructor(private socketService: SocketService) {
        this.resetTimer();
    }

    alterTimer(increment: number): void {
        this.timer += increment;
    }

    stopTimer(): void {
        this.socketService.unsubscribeTimer();
    }

    resetTimer(): void {
        this.timer = 0;
    }

    startTimer(): void {
        this.socketService.subscribeTimer((clock: number) => {
            this.timer = clock;
        });
    }

    getFormattedTime(time?: number): string {
        return this.timer >= 0 ? this.formatTime(time ? time : this.timer) : '00:00';
    }

    formatTime(time: number): string {
        if (time >= MAX_TIMER_TIME) return '99:59';
        return this.setTwoIntegerDigits(Math.floor(time / SECONDS_PER_MINUTE)) + ':' + this.setTwoIntegerDigits(time % SECONDS_PER_MINUTE);
    }

    private setTwoIntegerDigits(value: number): string {
        return value.toLocaleString('en-us', { minimumIntegerDigits: 2 });
    }
}
