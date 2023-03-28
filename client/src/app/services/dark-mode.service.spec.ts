import { TestBed } from '@angular/core/testing';

import { DarkModeService } from './dark-mode.service';

describe('DarkModeService', () => {
    let darkModeService: DarkModeService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        darkModeService = TestBed.inject(DarkModeService);
    });

    it('should be created', () => {
        expect(darkModeService).toBeTruthy();
    });

    describe('constructor', () => {
        it('should initialize this.darkModeEnabled to false', () => {
            expect(darkModeService.darkModeEnabled).toBeFalse();
        });
    });

    describe('getBackgroundClass', () => {
        it('should return the light theme class when dark mode is disabled', () => {
            darkModeService.darkModeEnabled = false;
            expect(darkModeService.getBackgroundClass()).toBe('background-image');
        });
        it('should return the dark theme class when dark mode is enabled', () => {
            darkModeService.darkModeEnabled = true;
            expect(darkModeService.getBackgroundClass()).toBe('background-image-dark');
        });
    });
});
