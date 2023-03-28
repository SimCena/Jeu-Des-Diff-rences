import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppMaterialModule } from '@app/modules/material.module';

import { BackgroundComponent } from './background.component';

describe('BackgroundComponent', () => {
    let component: BackgroundComponent;
    let fixture: ComponentFixture<BackgroundComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BackgroundComponent],
            imports: [AppMaterialModule],
        }).compileComponents();

        fixture = TestBed.createComponent(BackgroundComponent);
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
