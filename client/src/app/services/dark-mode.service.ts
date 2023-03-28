import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DarkModeService {
    darkModeEnabled: boolean;

    constructor() {
        this.darkModeEnabled = false;
    }

    getBackgroundClass(): string {
        if (this.darkModeEnabled) {
            return 'background-image-dark';
        }
        return 'background-image';
    }
}
