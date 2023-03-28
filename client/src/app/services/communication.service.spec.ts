/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { CommunicationService } from '@app/services/communication.service';
import { DifferenceImageParam } from '@common/difference-image-param';
import { GameData } from '@common/game-data';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@common/constants/image';
import { GameConstantsInput } from '@common/game-constants-input';

describe('CommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationService;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [HttpClientTestingModule],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('postDifferenceImage', () => {
        let differenceImage: DifferenceImageParam;

        beforeEach(() => {
            differenceImage = {
                images: [CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT).getContext('2d')!.createImageData(IMAGE_WIDTH, IMAGE_HEIGHT)],
                radius: 0,
            };
        });

        it('should call post on the HttpClient', () => {
            const spy = spyOn(service['http'], 'post').and.callThrough();
            service.postDifferenceImage(differenceImage);
            expect(spy).toHaveBeenCalled();
        });

        it('should send a single post request (HttpClient called once)', () => {
            service.postDifferenceImage(differenceImage).subscribe({
                next: () => {
                    return;
                },
                error: fail,
            });
            const req = httpMock.expectOne(`${baseUrl}/differenceImage`);
            expect(req.request.method).toBe('POST');
        });
    });

    describe('putGame', () => {
        let gameData: GameData;

        beforeEach(() => {
            gameData = {
                gameName: '',
                originalImage: CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT).getContext('2d')!.createImageData(IMAGE_WIDTH, IMAGE_HEIGHT),
                modifiedImage: CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT).getContext('2d')!.createImageData(IMAGE_WIDTH, IMAGE_HEIGHT),
                differenceImage: [{ positions: [], differenceNumber: 0 }],
            };
        });

        it('should call put on the HttpClient', () => {
            const spy = spyOn(service['http'], 'put').and.callThrough();
            service.putGame(gameData);
            expect(spy).toHaveBeenCalled();
        });
        it('should send a single PUT request (HttpClient called once)', () => {
            service.putGame(gameData).subscribe({
                next: () => {
                    return;
                },
                error: fail,
            });
            const req = httpMock.expectOne(`${baseUrl}/games`);
            expect(req.request.method).toBe('PUT');
        });
    });

    describe('putGameConstants', () => {
        let gameConstants: GameConstantsInput;

        beforeEach(() => {
            gameConstants = {
                initialTime: 30,
                goodGuessTime: 5,
                hintUsedTime: 5,
            };
        });

        it('should call put on the HttpClient', () => {
            const spy = spyOn(service['http'], 'put').and.callThrough();
            service.putGameConstants(gameConstants);
            expect(spy).toHaveBeenCalled();
        });
        it('should send a single PUT request (HttpClient called once)', () => {
            service.putGameConstants(gameConstants).subscribe({
                next: () => {
                    return;
                },
                error: fail,
            });
            const req = httpMock.expectOne(`${baseUrl}/constants`);
            expect(req.request.method).toBe('PUT');
        });
    });

    describe('getGames', () => {
        it('should call get on the HttpClient', () => {
            const spy = spyOn(service['http'], 'get').and.callThrough();
            service.getGames();
            expect(spy).toHaveBeenCalled();
        });
        it('should send a single GET request (HttpClient called once)', () => {
            service.getGames().subscribe({
                next: () => {
                    return;
                },
                error: fail,
            });
            const req = httpMock.expectOne(`${baseUrl}/games`);
            expect(req.request.method).toBe('GET');
        });
    });

    describe('getGameConstants', () => {
        it('should call get on the HttpClient', () => {
            const spy = spyOn(service['http'], 'get').and.callThrough();
            service.getGameConstants();
            expect(spy).toHaveBeenCalled();
        });
        it('should send a single GET request (HttpClient called once)', () => {
            service.getGameConstants().subscribe({
                next: () => {
                    return;
                },
                error: fail,
            });
            const req = httpMock.expectOne(`${baseUrl}/constants`);
            expect(req.request.method).toBe('GET');
        });
    });
});
