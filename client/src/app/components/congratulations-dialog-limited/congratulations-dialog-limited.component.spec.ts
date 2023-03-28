import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import { UrlSerializer } from '@angular/router';
import { CongratulationsDialogLimitedComponent } from '@app/components/congratulations-dialog-limited/congratulations-dialog-limited.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { ClockService } from '@app/services/clock.service';
import { GameRequestsService } from '@app/services/game-requests.service';
import { MouseHandlerService } from '@app/services/mouse-handler.service';
import { SocketService } from '@app/services/socket.service';

const dialogMock = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    close: () => {},
};

describe('CongratulationsDialogLimitedComponent', () => {
    let component: CongratulationsDialogLimitedComponent;
    let fixture: ComponentFixture<CongratulationsDialogLimitedComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CongratulationsDialogLimitedComponent],
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
                        playerName: 'matcorb',
                        teammateName: 'simcena',
                        score: 6,
                        formattedTime: '00:46',
                        timeExpired: false,
                    },
                },
                {
                    provide: MatDialogRef,
                    useValue: dialogMock,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CongratulationsDialogLimitedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    afterEach(() => {
        fixture.destroy();
    });
});
