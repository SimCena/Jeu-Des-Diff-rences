/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { UrlSerializer } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/modules/material.module';
import { SocketService } from '@app/services/socket.service';
import { GameClient } from '@common/games';
import { GameViewerComponent } from './game-viewer.component';

export const game: GameClient = {
    id: 0,
    name: '',
    url: '',
    solo: [],
    multiplayer: [],
    differenceCount: 3,
};

@Injectable({
    providedIn: 'root',
})
class MockSocketService extends SocketService {
    on(): void {
        return;
    }
    subscribeDeletedGame(): void {
        return;
    }
    unsubscribeGameViewerUpdates(): void {
        return;
    }
}

describe('GameViewerComponent', () => {
    let component: GameViewerComponent;
    let fixture: ComponentFixture<GameViewerComponent>;
    let socketService: SocketService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameViewerComponent],
            imports: [AppMaterialModule, HttpClientTestingModule, MatDialogModule, ReactiveFormsModule, RouterTestingModule],
            providers: [
                UrlSerializer,
                {
                    provide: SocketService,
                    useClass: MockSocketService,
                },
            ],
        }).compileComponents();

        socketService = TestBed.inject(SocketService);
        fixture = TestBed.createComponent(GameViewerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should updateGames once the gameSubject undergoes a change', () => {
            const updateGamesSpy = spyOn(component.gameRequestService, 'getGames');
            component.ngOnInit();
            expect(updateGamesSpy).toHaveBeenCalled();
        });
    });

    describe('hasGameBefore', () => {
        it('should return false if it does not have games', () => {
            component['firstGameID'] = 0;
            component.gameRequestService.games = [];
            expect(component['hasGameBefore']()).toBeFalse();
        });
        it('should return false if it does not have games before', () => {
            component['firstGameID'] = 0;
            component.gameRequestService.games = [game];
            expect(component['hasGameBefore']()).toBeFalse();
        });
        it('should return true if it has games before', () => {
            component['firstGameID'] = 4;
            component.gameRequestService.games = [game, game, game, game, game];
            expect(component['hasGameBefore']()).toBeTrue();
        });
    });

    describe('hasGameAfter', () => {
        it('hasGameAfter() should return false if it does not have games', () => {
            component['firstGameID'] = 0;
            component.gameRequestService.games = [];
            expect(component['hasGameAfter']()).toBeFalse();
        });
        it('should return false if it does not have games after', () => {
            component['firstGameID'] = 0;
            component.gameRequestService.games = [game];
            expect(component['hasGameAfter']()).toBeFalse();
        });
        it('hasGamesAfter() should return true if it has games after', () => {
            component['firstGameID'] = 0;
            component.gameRequestService.games = [game, game, game, game, game];
            expect(component['hasGameAfter']()).toBeTrue();
        });
    });

    describe('goForward', () => {
        it('should properly increment firstGameId', () => {
            component['firstGameID'] = 0;
            component['goForward']();
            expect(component['firstGameID']).toBe(4);
        });
    });

    describe('goBackward', () => {
        it('should properly decrement firstGameId', () => {
            component['firstGameID'] = 4;
            component['goBackward']();
            expect(component['firstGameID']).toBe(0);
        });
    });

    describe('configureSubscriptions', () => {
        it('subscribeModifiedDatabase callback should get games', () => {
            const spy = spyOn(component.gameRequestService, 'getGames');
            spyOn(socketService, 'subscribeModifiedDatabase').and.callFake((callback) => {
                return callback();
            });
            component['configureSubscriptions']();
            expect(spy).toHaveBeenCalled();
        });
    });
});
