import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActionType } from '@app/models/action-type';
import { AppMaterialModule } from '@app/modules/material.module';

import { ConfirmationDialogComponent } from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
    let component: ConfirmationDialogComponent;
    let fixture: ComponentFixture<ConfirmationDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfirmationDialogComponent],
            imports: [AppMaterialModule],
            providers: [
                { provide: MatDialogRef, useValue: [] },
                { provide: MAT_DIALOG_DATA, useValue: ActionType.DeleteAll },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfirmationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
