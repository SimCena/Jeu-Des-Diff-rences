import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UrlSerializer } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { BackgroundComponent } from '@app/components/background/background.component';
import { GameConstantsDialogComponent } from '@app/components/game-constants-dialog/game-constants-dialog.component';
import { GameViewerComponent } from '@app/components/game-viewer/game-viewer.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { of } from 'rxjs';
import { AdministrationPageComponent } from './administration-page.component';
import { Injectable } from '@angular/core';
import { SocketService } from '@app/services/socket.service';

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
    unsubscribeRoomUpdates(): void {
        return;
    }

    unsubscribeFailedDelete(): void {
        return;
    }

    unsubscribeFailedReset(): void {
        return;
    }
}

describe('AdministrationPageComponent', () => {
    let component: AdministrationPageComponent;
    let fixture: ComponentFixture<AdministrationPageComponent>;
    let mockSocketService: SocketService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdministrationPageComponent, GameViewerComponent, BackgroundComponent],
            imports: [AppMaterialModule, HttpClientTestingModule, ReactiveFormsModule, RouterTestingModule, MatDialogModule, BrowserAnimationsModule],
            providers: [UrlSerializer, { provide: SocketService, useClass: MockSocketService }],
        }).compileComponents();

        mockSocketService = TestBed.inject(SocketService);
        fixture = TestBed.createComponent(AdministrationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnDestroy', () => {
        it('should unsubscribe if socket is alive', () => {
            spyOn(mockSocketService, 'isSocketAlive').and.returnValue(true);
            const spy = spyOn(mockSocketService, 'unsubscribeAdministration');
            component.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('modifyGameConstants', () => {
        it('should call the appropriate communication service method if the confirmation button was pressed', () => {
            const spy = spyOn(component['communicationService'], 'putGameConstants').and.returnValue(of({ title: 'test', body: '' }));
            spyOn(component['dialog'], 'open').and.returnValue({
                afterClosed: () => of({ initialTime: 30, goodGuessTime: 5, hintUsedTime: 5 }),
            } as MatDialogRef<GameConstantsDialogComponent>);
            component['modifyGameConstants']();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('confirmReset', () => {
        it('should call the appropriate communication service method if the confirmation button was pressed', () => {
            const spy = spyOn(component['socketService'], 'resetGames');
            spyOn(component['dialog'], 'open').and.returnValue({
                afterClosed: () => of(true),
            } as MatDialogRef<ConfirmationDialogComponent>);
            component['confirmReset']();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('confirmReset', () => {
        it('should call the appropriate communication service method if the confirmation button was pressed', () => {
            const spy = spyOn(component['socketService'], 'deleteGames');
            spyOn(component['dialog'], 'open').and.returnValue({
                afterClosed: () => of(true),
            } as MatDialogRef<ConfirmationDialogComponent>);
            component['confirmDelete']();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('configureSubscriptions', () => {
        it('should configure subscribeFailedDelete', () => {
            spyOn(mockSocketService, 'subscribeFailedDelete').and.callFake((callback) => {
                return callback();
            });
            const spy = spyOn(component['snackBar'], 'open');
            component['configureSubscriptions']();
            expect(spy).toHaveBeenCalledTimes(1);
        });
        it('should configure subscribeFailedReset', () => {
            spyOn(mockSocketService, 'subscribeFailedReset').and.callFake((callback) => {
                return callback();
            });
            const spy = spyOn(component['snackBar'], 'open');
            component['configureSubscriptions']();
            expect(spy).toHaveBeenCalledTimes(1);
        });
        it('should configure subscribeFailedDeleteAll', () => {
            spyOn(mockSocketService, 'subscribeFailedDeleteAll').and.callFake((callback) => {
                return callback();
            });
            const spy = spyOn(component['snackBar'], 'open');
            component['configureSubscriptions']();
            expect(spy).toHaveBeenCalledTimes(1);
        });
        it('should configure subscribeFailedResetAll', () => {
            spyOn(mockSocketService, 'subscribeFailedResetAll').and.callFake((callback) => {
                return callback();
            });
            const spy = spyOn(component['snackBar'], 'open');
            component['configureSubscriptions']();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });
});
