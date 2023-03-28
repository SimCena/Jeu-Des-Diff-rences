/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ChildrenOutletContexts, UrlSerializer } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameHandlerService } from '@app/services/game-handler.service';
import { AttemptResponse, Difference } from '@common/games';
import { GameRunner } from './game-runner';

class ImplementedRunner extends GameRunner {
    initSocketSubscriptions(): void {
        return;
    }
    protected initBooleans(): void {
        return;
    }
    protected initDifferences(): void {
        return;
    }
    protected giveSuccessFeedback(): void {
        return;
    }
    protected giveFailFeedback(): void {
        return;
    }
    protected updateDifferencesFound(): void {
        return;
    }
}

@Injectable({
    providedIn: 'root',
})
class MockGameHandlerService extends GameHandlerService {}

describe('GameRunner', () => {
    let service: ImplementedRunner;
    let gameHandlerService: GameHandlerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: GameHandlerService,
                    useClass: MockGameHandlerService,
                },
                UrlSerializer,
                ChildrenOutletContexts,
            ],
            imports: [AppMaterialModule, HttpClientTestingModule, RouterTestingModule],
        });

        gameHandlerService = TestBed.inject(GameHandlerService);
        service = new ImplementedRunner(gameHandlerService);
    });

    it('should create an instance', () => {
        expect(service).toBeTruthy();
    });

    describe('initGame', () => {
        it('should call initBooleans', () => {
            const spy = spyOn<any>(service, 'initBooleans');
            spyOn<any>(service, 'initDifferences');

            service.initGame();
            expect(spy).toHaveBeenCalled();
        });
        it('should call initDifferences', () => {
            const spy = spyOn<any>(service, 'initDifferences');
            spyOn<any>(service, 'initBooleans');

            service.initGame();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('sendFeedback', () => {
        it('if difference is defined giveSuccessFeedback is called', () => {
            const attemptResponse: AttemptResponse = {
                difference: {
                    differenceNumber: 1,
                    positions: [0, 1, 2],
                },
                playerId: 'simon',
            };
            const spy = spyOn<any>(service, 'giveSuccessFeedback');
            service['sendFeedback'](attemptResponse);
            expect(spy).toHaveBeenCalledWith(attemptResponse);
        });
        it('if images is not defined giveFailFeedback is called', () => {
            spyOn<any>(service, 'giveSuccessFeedback');
            const spy = spyOn<any>(service, 'giveFailFeedback');
            service['sendFeedback']({ difference: undefined as unknown as Difference, playerId: 'simon' });
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('lockAttempt', () => {
        it('shoul enable attempts after 1 second since function call', () => {
            gameHandlerService['attemptsEnabled'] = false;
            jasmine.clock().install();
            service['lockAttempts']();
            expect(gameHandlerService['attemptsEnabled']).toBeFalse();
            jasmine.clock().tick(1500);
            expect(gameHandlerService['attemptsEnabled']).toBeTrue();
            jasmine.clock().uninstall();
        });
    });
});
