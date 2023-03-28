import { Component } from '@angular/core';
import { DarkModeService } from '@app/services/dark-mode.service';

@Component({
    selector: 'app-background',
    templateUrl: './background.component.html',
    styleUrls: ['./background.component.scss'],
})
export class BackgroundComponent {
    constructor(protected darkModeService: DarkModeService) {}
}
