/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppMaterialModule } from '@app/modules/material.module';
import { ClockService } from './clock.service';
import { SocketService } from './socket.service';

@Injectable({
    providedIn: 'root',
})
class MockSocketService extends SocketService {
    on(): void {
        return;
    }

    send(): void {
        return;
    }

    unsubscribeTimer(): void {
        return;
    }
}

describe('ClockService', () => {
    let socketService: SocketService;
    let service: ClockService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppMaterialModule],
            providers: [{ provide: SocketService, useClass: MockSocketService }],
        });
        socketService = TestBed.inject(SocketService);
        service = TestBed.inject(ClockService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call resetTimer on creation', () => {
        const spy = spyOn(ClockService.prototype, 'resetTimer');
        service = new ClockService(socketService);
        expect(spy).toHaveBeenCalled();
    });

    describe('stopTimer', () => {
        it('should unsubscribe the timer', () => {
            const spy = spyOn(socketService, 'unsubscribeTimer');
            service.stopTimer();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('getFormattedTime', () => {
        it('should return formatTime for truthy timer', () => {
            service['timer'] = 1;
            expect(service.getFormattedTime()).toEqual('00:01');
        });

        it('should return 00:00 for falsy timer', () => {
            service['timer'] = -1;
            expect(service.getFormattedTime()).toEqual('00:00');
        });
    });

    describe('resetTimer', () => {
        it('should reset Timer', () => {
            service.resetTimer();
            expect(service['timer']).toBe(0);
        });
    });

    describe('startTimer', () => {
        it('should subsribe to the socket service timer event', () => {
            const spy = spyOn(socketService, 'subscribeTimer');
            service.startTimer();
            expect(spy).toHaveBeenCalled();
        });
        it('should increment the timer when it receives a notification', () => {
            const clock = 1;
            spyOn(service['socketService'], 'subscribeTimer').and.callFake((callback) => {
                return callback(clock);
            });
            service.startTimer();
            expect(service['timer']).toBe(1);
        });
    });

    describe('setTwoIntegerDigits', () => {
        it('should return Number.localString', () => {
            const value = 1;
            expect(service['setTwoIntegerDigits'](value)).toBe(value.toLocaleString('en-us', { minimumIntegerDigits: 2 }));
        });
    });

    describe('formatTime', () => {
        it('should return right value for exceeded time', () => {
            const value = 5999;
            expect(service.formatTime(value)).toBe('99:59');
        });

        it('should return the right value for valid time', () => {
            const value = 4321;
            expect(service.formatTime(value)).toBe('72:01');
        });
    });

    describe('alterTime', () => {
        it('should properly increase the timer when given a positive number', () => {
            service.timer = 15;
            service.alterTimer(5);
            expect(service.timer).toBe(20);
        });
        it('should properly decrease the timer when given a negative number', () => {
            service.timer = 15;
            service.alterTimer(-5);
            expect(service.timer).toBe(10);
        });
    });
});
