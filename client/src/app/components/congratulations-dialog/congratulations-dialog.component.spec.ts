import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UrlSerializer } from '@angular/router';
import { CongratulationsDialogComponent } from './congratulations-dialog.component';
import { SocketService } from '@app/services/socket.service';
import { MouseHandlerService } from '@app/services/mouse-handler.service';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameRequestsService } from '@app/services/game-requests.service';
import { ClockService } from '@app/services/clock.service';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import { PlayerRanking } from '@common/player-ranking';

const dialogMock = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    close: () => {},
};

describe('CongratulationsDialogComponent', () => {
    let component: CongratulationsDialogComponent;
    let fixture: ComponentFixture<CongratulationsDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CongratulationsDialogComponent],
            imports: [AppMaterialModule, HttpClientTestingModule, BrowserTestingModule],
            providers: [
                UrlSerializer,
                ClockService,
                SocketService,
                MouseHandlerService,
                GameRequestsService,
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        gameId: 0,
                        playerName: 'Jean',
                        winnerName: 'Jean',
                        gameName: 'La baleine',
                        formattedTime: '00:10',
                    },
                },
                {
                    provide: MatDialogRef,
                    useValue: dialogMock,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CongratulationsDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('getFormattedTime', () => {
        it('should return the short time if isPlayerWinner false', () => {
            component.scoreInfo.isPlayerWinner = false;
            expect(component['getFormattedTime']()).toEqual('00:10');
        });
        it('should return the short time if isPlayerWinner false', () => {
            component.scoreInfo.isPlayerWinner = true;
            component.scoreInfo.playerRanking = PlayerRanking.First;
            expect(component['getFormattedTime']()).toEqual('00:10 (1ère place)');
        });
        it('should return the short time if isPlayerWinner false', () => {
            component.scoreInfo.isPlayerWinner = true;
            component.scoreInfo.playerRanking = undefined as unknown as PlayerRanking;
            expect(component['getFormattedTime']()).toEqual('00:10');
        });
    });

    describe('setErrorPrevention', () => {
        it('should open a snackbar if playerRanking is not recorded', () => {
            component.scoreInfo.playerRanking = PlayerRanking.NotRecorded;
            const spy = spyOn(component['snackBar'], 'open');
            component['setErrorPrevention']();
            expect(spy).toHaveBeenCalledWith('Erreur 503 - Impossible de sauvegarder votre score', undefined, { duration: 3500 });
        });
        it('should not open a snackbar if playerRanking is not not recorded', () => {
            component.scoreInfo.playerRanking = PlayerRanking.First;
            const spy = spyOn(component['snackBar'], 'open');
            component['setErrorPrevention']();
            expect(spy).not.toHaveBeenCalledWith('Erreur 503 - Impossible de sauvegarder votre score', undefined, { duration: 3500 });
        });
    });

    afterEach(() => {
        fixture.destroy();
    });
});
