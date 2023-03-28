/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, UrlSerializer } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameClient } from '@common/games';
import { of } from 'rxjs';
import { CommunicationService } from './communication.service';

import { GameRequestsService } from './game-requests.service';

const firstGameStub: GameClient = {
    id: 0,
    name: '',
    url: 'test/0',
    solo: [],
    multiplayer: [],
    differenceCount: 1,
};

const secondGameStub: GameClient = {
    id: 1,
    name: '',
    url: 'test/1',
    solo: [],
    multiplayer: [],
    differenceCount: 1,
};

const thirdGameStub: GameClient = {
    id: 2,
    name: '',
    url: 'test/3',
    solo: [],
    multiplayer: [],
    differenceCount: 2,
};

describe('GameRequestsService', () => {
    let gameService: GameRequestsService;
    let communicationService: CommunicationService;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, AppMaterialModule],
            providers: [UrlSerializer, CommunicationService],
        }).compileComponents();
        gameService = TestBed.inject(GameRequestsService);
        communicationService = TestBed.inject(CommunicationService);
        router = TestBed.inject(Router);
    });

    it('should be created', () => {
        expect(gameService).toBeTruthy();
    });

    describe('getGames', () => {
        it('should call this.communicationService.getGames', () => {
            const spy = spyOn(communicationService, 'getGames').and.returnValue(of([firstGameStub, secondGameStub]));
            gameService.getGames();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('getGame', () => {
        it('should return the right game if no index is passed in parameter', () => {
            gameService.games = [firstGameStub, secondGameStub, thirdGameStub];
            gameService.currentGameId = 1;
            expect(gameService.getGame()).toBe(secondGameStub);
        });
    });

    describe('getGameUrl', () => {
        it('should return the right game url', () => {
            gameService.games = [firstGameStub, secondGameStub, thirdGameStub];
            expect(gameService.getGameUrl(0)).toBe('test/0');
        });
    });

    describe('hasGames', () => {
        it('should return true if there are games', () => {
            gameService.games = [firstGameStub, secondGameStub, thirdGameStub];
            expect(gameService.hasGames()).toBe(true);
        });

        it('should return false if there are no games', () => {
            gameService.games = [];
            expect(gameService.hasGames()).toBe(false);
        });

        it('should return false if games is undefined', () => {
            expect(gameService.hasGames()).toBe(false);
        });
    });

    describe('abandonGame', () => {
        it('should navigate to the right page', () => {
            const spy = spyOn(router, 'navigate');
            gameService.abandonGame();
            expect(spy).toHaveBeenCalledWith(['home']);
        });
    });

    describe('returnToSelect', () => {
        it('should navigate to the right page', () => {
            const spy = spyOn(router, 'navigate');
            gameService.returnToSelect();
            expect(spy).toHaveBeenCalledWith(['select']);
        });
    });

    describe('launchGame', () => {
        it('should navigate to the solo game page if limited undefined', () => {
            const spy = spyOn(router, 'navigate');
            gameService.launchGame(0);
            expect(spy).toHaveBeenCalledWith(['play', 'classic', 'solo'], { queryParams: { id: 0 } });
        });
        it('should navigate to the solo game page if limited false', () => {
            const spy = spyOn(router, 'navigate');
            gameService.launchGame(0, false);
            expect(spy).toHaveBeenCalledWith(['play', 'classic', 'solo'], { queryParams: { id: 0 } });
        });
        it('should navigate to the limited game page if limited true', () => {
            const spy = spyOn(router, 'navigate');
            gameService.launchGame(0, true);
            expect(spy).toHaveBeenCalledWith(['play', 'limited'], { queryParams: { id: 0 } });
        });
    });

    describe('launchMultiplayerWaitingRoom', () => {
        it('should navigate to the right page', () => {
            const spy = spyOn(router, 'navigate');
            gameService.launchMultiplayerWaitingRoom(0);
            expect(spy).toHaveBeenCalledWith(['waiting', 'classic'], { queryParams: { id: 0 } });
        });
    });

    describe('launchLimitedWaitingRoom', () => {
        it('should navigate to the right page', () => {
            const spy = spyOn(router, 'navigate');
            gameService.launchLimitedWaitingRoom(0);
            expect(spy).toHaveBeenCalledWith(['waiting', 'limited'], { queryParams: { id: 0 } });
        });
    });

    describe('launchMultiplayerGame', () => {
        it('should navigate to the right page if not limited', () => {
            const spy = spyOn(router, 'navigate');
            gameService.currentGameId = 0;
            gameService.launchMultiplayerGame();
            expect(spy).toHaveBeenCalledWith(['play', 'classic', 'multi'], { queryParams: { id: 0 } });
        });
        it('should navigate to the right page if limited', () => {
            const spy = spyOn(router, 'navigate');
            gameService.currentGameId = 0;
            gameService.launchMultiplayerGame(true);
            expect(spy).toHaveBeenCalledWith(['play', 'limited'], { queryParams: { id: 0 } });
        });
    });
});
