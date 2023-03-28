import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { KickedMessageType } from '@app/models/kicked-message-type';
import { AppMaterialModule } from '@app/modules/material.module';

import { KickedDialogComponent } from './kicked-dialog.component';

describe('KickedDialogComponent', () => {
    let component: KickedDialogComponent;
    let fixture: ComponentFixture<KickedDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [KickedDialogComponent],
            imports: [AppMaterialModule],
            providers: [
                { provide: MatDialogRef, useValue: [] },
                { provide: MAT_DIALOG_DATA, useValue: KickedMessageType.DeletedGame },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(KickedDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
