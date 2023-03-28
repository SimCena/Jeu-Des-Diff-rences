import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectionPageComponent } from './selection-page.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GameViewerComponent } from '@app/components/game-viewer/game-viewer.component';
import { UrlSerializer } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackgroundComponent } from '@app/components/background/background.component';

describe('SelectionPageComponent', () => {
    let component: SelectionPageComponent;
    let fixture: ComponentFixture<SelectionPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BackgroundComponent, SelectionPageComponent, GameViewerComponent],
            imports: [HttpClientTestingModule, AppMaterialModule, RouterTestingModule],
            providers: [UrlSerializer],
        }).compileComponents();

        fixture = TestBed.createComponent(SelectionPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
