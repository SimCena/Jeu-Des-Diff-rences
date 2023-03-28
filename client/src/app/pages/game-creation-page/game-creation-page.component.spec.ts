/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-classes-per-file */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BackgroundCanvasComponent } from '@app/components/background-canvas/background-canvas.component';
import { ImageDifferenceDialogComponent } from '@app/components/image-difference-dialog/image-difference-dialog.component';
import { CanvasId } from '@app/models/canvas-id';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadComponent } from '@app/components/file-upload/file-upload.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { CommunicationService } from '@app/services/communication.service';
import { ImageVerificationService } from '@app/services/image-verification.service';
import { DifferenceImageParam } from '@common/difference-image-param';
import { GameData } from '@common/game-data';
import { Observable, of } from 'rxjs';
import { GameCreationPageComponent } from './game-creation-page.component';
import { Injectable } from '@angular/core';
import { ForegroundCanvasComponent } from '@app/components/foreground-canvas/foreground-canvas.component';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@common/constants/image';
import { ColorPickerComponent } from '@app/components/color-picker/color-picker.component';
import { BackgroundComponent } from '@app/components/background/background.component';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { SocketService } from '@app/services/socket.service';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import { Difference } from '@common/games';

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

    isSocketAlive(): boolean {
        return false;
    }

    unsubscribeMessageSent(): void {
        return;
    }
}

@Injectable({
    providedIn: 'root',
})
class MockCommunicationService extends CommunicationService {
    postDifferenceImage(params: DifferenceImageParam): Observable<Difference[]> {
        return new Observable<Difference[]>((observer) => {
            const convertedData: number[] = [];
            params.images[0].data.forEach((value) => {
                convertedData.push(value);
            });
            observer.next([{ positions: [1, 2, 3], differenceNumber: 0 }]);
        });
    }

    putGame(params: GameData): Observable<boolean> {
        return new Observable<boolean>((observer) => {
            observer.next(params === params);
        });
    }
}

@Injectable({
    providedIn: 'root',
})
class MockImageVerification extends ImageVerificationService {
    async verifyImage(file: File): Promise<boolean> {
        return !!file;
    }
}

const difference: Difference = {
    differenceNumber: 0,
    positions: [0, 0, 0, 0],
};

const differenceImage: Difference[] = [difference, difference, difference];

describe('GameCreationPageComponent', () => {
    let component: GameCreationPageComponent;
    let fixture: ComponentFixture<GameCreationPageComponent>;
    let fakeImageData: ImageData;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                BackgroundCanvasComponent,
                ForegroundCanvasComponent,
                GameCreationPageComponent,
                FileUploadComponent,
                ImageDifferenceDialogComponent,
                ColorPickerComponent,
                BackgroundComponent,
            ],
            imports: [
                AppMaterialModule,
                HttpClientTestingModule,
                BrowserAnimationsModule,
                BrowserTestingModule,
                FormsModule,
                ReactiveFormsModule,
                RouterTestingModule,
            ],
            providers: [
                { provide: CommunicationService, useClass: MockCommunicationService },
                { provide: ImageVerificationService, useClass: MockImageVerification },
                { provide: SocketService, useClass: MockSocketService },
            ],
        }).compileComponents();

        fakeImageData = new ImageData(IMAGE_WIDTH, IMAGE_HEIGHT);
        fixture = TestBed.createComponent(GameCreationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should define gameName on construction', () => {
        expect(component['gameName']).toBeDefined();
    });

    it('should call keyPressed with right parameters on keydown event', () => {
        const keyEvent = new Event('keydown');
        const spy = spyOn<any>(component, 'keyPressed');
        document.body.dispatchEvent(keyEvent);
        expect(spy).toHaveBeenCalledWith(keyEvent);
    });

    describe('ngAfterViewInit', () => {
        it('should define foregrounds with right values', () => {
            component['foregrounds'] = [];
            component.ngAfterViewInit();
            expect(component['foregrounds']).toEqual([component['originalForeground'], component['modifiedForeground']]);
        });

        it('should define backgrounds with right values', () => {
            component['backgrounds'] = [];
            component.ngAfterViewInit();
            expect(component['backgrounds']).toEqual([component['originalBackground'], component['modifiedBackground']]);
        });

        it('should call updateToolSize', () => {
            const spy = spyOn<any>(component, 'updateToolSize');
            component.ngAfterViewInit();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('findArea', () => {
        it('should return an array containing originalForeground for CanvasId.ORIGINAL and foregrounds', () => {
            const drawingAreaArray = component['findArea'](CanvasId.ORIGINAL, component['foregrounds']);
            expect(drawingAreaArray.length).toBe(1);
            expect(drawingAreaArray[0]).toBe(component['originalForeground']);
        });

        it('should return an array containing modifiedBackground for CanvasId.MODIFIED and backgrounds', () => {
            const drawingAreaArray = component['findArea'](CanvasId.MODIFIED, component['backgrounds']);
            expect(drawingAreaArray.length).toBe(1);
            expect(drawingAreaArray[0]).toBe(component['modifiedBackground']);
        });

        it('should return an array containing both Foregrounds for CanvasId.BOTH and foregrounds', () => {
            const drawingAreaArray = component['findArea'](CanvasId.BOTH, component['foregrounds']);
            expect(drawingAreaArray.length).toBe(2);
            expect(drawingAreaArray).toEqual(component['foregrounds']);
        });

        it('should return an empty array for an invalid CanvasId', () => {
            const drawingAreaArray = component['findArea'](3, component['foregrounds']);
            expect(drawingAreaArray).toEqual([]);
        });

        it('should return an empty array for an invalid array', () => {
            const drawingAreaArray = component['findArea'](CanvasId.BOTH, []);
            expect(drawingAreaArray).toEqual([]);
        });
    });

    describe('eraseBackgroundImage', () => {
        it('should call eraseCanvas on appropriate background', () => {
            const spy = spyOn(component['originalBackground'], 'eraseCanvas');
            component['eraseBackgroundImage'](CanvasId.ORIGINAL);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('eraseForegroundImage', () => {
        it('should call eraseCanvas on appropriate drawingArea', () => {
            const spy = spyOn(component['originalForeground'], 'eraseCanvas');
            component['eraseForegroundImage'](CanvasId.ORIGINAL);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('getCanvasId', () => {
        it('should return CanvasId', () => {
            expect(component['getCanvasIdEnum']()).toBe(CanvasId);
        });
    });

    describe('getError', () => {
        it('should return empty string for no error', () => {
            spyOn(component['gameName'], 'hasError').and.returnValue(false);
            expect(component['getError']()).toBe('Doit être compris entre 1 et 30 caractères');
        });

        it('should return valid string for error', () => {
            spyOn(component['gameName'], 'hasError').and.returnValue(true);
            expect(component['getError']()).toBe('Nom de jeu obligatoire');
        });
    });

    describe('validateGameName', () => {
        it('should mark the name input as touched and update the name value and validity', () => {
            const markAsTouchedSpy = spyOn(component['gameName'], 'markAsTouched');
            const updateValueAndValiditySpy = spyOn(component['gameName'], 'updateValueAndValidity');
            component['validateGameName']();
            expect(markAsTouchedSpy).toHaveBeenCalled();
            expect(updateValueAndValiditySpy).toHaveBeenCalled();
        });
    });

    describe('openImageDifferenceDialog', () => {
        it('should open and return a MatDialogRef with the right parameters', () => {
            const spy = spyOn(component['matDialogService'], 'open').and.callThrough();
            expect(component['openImageDifferenceDialog'](differenceImage)).toBeDefined();
            expect(spy).toHaveBeenCalledOnceWith(ImageDifferenceDialogComponent, {
                data: {
                    differenceImage,
                },
                enterAnimationDuration: '500ms',
                exitAnimationDuration: '500ms',
                disableClose: true,
            });
        });
    });

    describe('getDifferenceImage', () => {
        it('should call getMergedImageData on originalCanvas', waitForAsync(() => {
            const spy = spyOn<any>(component, 'getMergedImageData').and.returnValue(Promise.resolve(fakeImageData));
            spyOn<any>(component, 'openImageDifferenceDialog').and.returnValue({
                afterClosed: () => of(true),
            } as MatDialogRef<ImageDifferenceDialogComponent>);
            component['getDifferenceImage'](true).then(() => {
                expect(spy).toHaveBeenCalledTimes(2);
            });
        }));

        it('should call postDifferenceImage with right parameters', waitForAsync(() => {
            spyOn<any>(component, 'getMergedImageData').and.returnValue(Promise.resolve(fakeImageData));
            spyOn<any>(component, 'openImageDifferenceDialog').and.returnValue({
                afterClosed: () => of(true),
            } as MatDialogRef<ImageDifferenceDialogComponent>);
            const spy = spyOn(component['communicationService'], 'postDifferenceImage').and.callThrough();
            component['getDifferenceImage'](true).then(() => {
                expect(spy).toHaveBeenCalledWith({
                    images: [fakeImageData, fakeImageData],
                    radius: component['radius'],
                });
            });
        }));

        it('should call openImageDifferenceDialog', waitForAsync(() => {
            spyOn<any>(component, 'getMergedImageData').and.returnValue(Promise.resolve(fakeImageData));
            const spy = spyOn<any>(component, 'openImageDifferenceDialog').and.returnValue({
                afterClosed: () => of(true),
            } as MatDialogRef<ImageDifferenceDialogComponent>);
            component['getDifferenceImage'](true).then(() => {
                expect(spy).toHaveBeenCalled();
            });
        }));

        it('should call determineSavedImageParam', waitForAsync(() => {
            spyOn(component['matDialogService'], 'open').and.returnValue({
                afterClosed: () => of(true),
            } as MatDialogRef<ImageDifferenceDialogComponent>);
            const spy = spyOn<any>(component, 'determineSavedImageParam').and.callThrough();
            component['getDifferenceImage'](true).then(() => {
                expect(spy).toHaveBeenCalled();
            });
        }));

        it('should return undefined for invalid differenceCount', async () => {
            spyOn(component['matDialogService'], 'open').and.returnValue({
                afterClosed: () => of(false),
            } as MatDialogRef<ImageDifferenceDialogComponent>);
            expect(await component['getDifferenceImage'](false)).toBe(undefined);
        });

        it('should return a value for valid differenceCount', async () => {
            spyOn(component['matDialogService'], 'open').and.returnValue({
                afterClosed: () => of(true),
            } as MatDialogRef<ImageDifferenceDialogComponent>);
            expect(await component['getDifferenceImage'](true)).toBeDefined();
        });
    });

    describe('saveGame', () => {
        beforeEach(async () => {
            spyOn<any>(component, 'getMergedImageData').and.returnValue(Promise.resolve(fakeImageData));
        });

        it('should open snackBar with warning message for empty gameName', () => {
            const spy = spyOn(component['snackBar'], 'open');
            component['saveGame']();
            expect(spy).toHaveBeenCalledWith('Veuillez entrer un nom pour le jeu.', undefined, { duration: 2000 });
        });

        it('should mark gameName as touched for empty gameName', () => {
            const spy = spyOn(component['gameName'], 'markAsTouched');
            component['saveGame']();
            expect(spy).toHaveBeenCalled();
        });

        it('should open snackBar with loading message for valid gameName', waitForAsync(() => {
            spyOn<any>(component, 'getDifferenceImage').and.returnValue(
                Promise.resolve({
                    gameName: 'test',
                    originalImage: new ImageData(1, 1),
                    modifiedImage: new ImageData(1, 1),
                    differenceImage: {
                        data: [],
                        count: 0,
                        differenceMap: {},
                    },
                }),
            );
            spyOn(Observable.prototype, 'subscribe');
            spyOn(component['gameName'], 'value').and.returnValue('validName');
            const spy = spyOn(component['snackBar'], 'open');
            component['saveGame']().then(() => {
                expect(spy).toHaveBeenCalledWith('Sauvegarde du jeu en cours...', undefined, { duration: 2000 });
            });
        }));

        it('should call postGame from communicationService if params is valid', async () => {
            spyOn(component['router'], 'navigate');
            spyOn(component['gameName'], 'value').and.returnValue('validName');
            spyOn<any>(component, 'getDifferenceImage').and.returnValue(
                Promise.resolve({
                    gameName: 'someString',
                    originalImage: await component['getMergedImageData'](CanvasId.ORIGINAL),
                    modifiedImage: await component['getMergedImageData'](CanvasId.MODIFIED),
                    differenceImage,
                }),
            );
            const spy = spyOn(component['communicationService'], 'putGame').and.callThrough();
            await component['saveGame']();
            expect(spy).toHaveBeenCalled();
        });

        it('should open snackBar with confirmation message if params is valid', async () => {
            spyOn(component['router'], 'navigate');
            spyOn(component['gameName'], 'value').and.returnValue('validName');
            spyOn<any>(component, 'getDifferenceImage').and.returnValue(
                Promise.resolve({
                    gameName: 'someString',
                    originalImage: await component['getMergedImageData'](CanvasId.ORIGINAL),
                    modifiedImage: await component['getMergedImageData'](CanvasId.MODIFIED),
                    differenceImage,
                }),
            );
            const spy = spyOn(component['snackBar'], 'open').and.callThrough();
            await component['saveGame']();
            expect(spy).toHaveBeenCalledWith('Jeu sauvegardé!', undefined, { duration: 2000 });
        });

        it('should open alert snackBar if not confirmation', async () => {
            spyOn(component['router'], 'navigate');
            spyOn(component['gameName'], 'value').and.returnValue('validName');
            spyOn<any>(component, 'getDifferenceImage').and.returnValue(
                Promise.resolve({
                    gameName: 'someString',
                    originalImage: await component['getMergedImageData'](CanvasId.ORIGINAL),
                    modifiedImage: await component['getMergedImageData'](CanvasId.MODIFIED),
                    differenceImage,
                }),
            );
            spyOn(component['communicationService'], 'putGame').and.returnValue(
                new Observable((subscriber) => {
                    subscriber.next(false);
                }),
            );
            const spy = spyOn(component['snackBar'], 'open');
            await component['saveGame']();
            expect(spy).toHaveBeenCalledWith('Erreur 503 - Le jeu ne peut pas être sauvegardé présentement', undefined, { duration: 3500 });
        });

        it('should navigate to the admin page on a successful save', async () => {
            spyOn(component['gameName'], 'value').and.returnValue('validName');
            spyOn<any>(component, 'getDifferenceImage').and.returnValue(
                Promise.resolve({
                    gameName: 'someString',
                    originalImage: await component['getMergedImageData'](CanvasId.ORIGINAL),
                    modifiedImage: await component['getMergedImageData'](CanvasId.MODIFIED),
                    differenceImage,
                }),
            );
            const spy = spyOn(component['router'], 'navigate');
            await component['saveGame']();
            expect(spy).toHaveBeenCalledWith(['/admin']);
        });

        it('should alert the gateway that a game has been created on a successful save', async () => {
            spyOn(component['gameName'], 'value').and.returnValue('validName');
            spyOn<any>(component, 'getDifferenceImage').and.returnValue(
                Promise.resolve({
                    gameName: 'someString',
                    originalImage: await component['getMergedImageData'](CanvasId.ORIGINAL),
                    modifiedImage: await component['getMergedImageData'](CanvasId.MODIFIED),
                    differenceImage,
                }),
            );
            spyOn(component['router'], 'navigate');
            const spy = spyOn(component['socketService'], 'createdGame');
            await component['saveGame']();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('requestImage', () => {
        it('should call drawOnCanvasFile for a valid File', async () => {
            const file = await fetch(new Request('../../assets/images/test_complex_image.bmp'))
                .then(async (response) => response.blob())
                .then((blob) => new File([blob], 'test_image.bmp', { type: 'image/bmp' }));
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            const spy = spyOn(BackgroundCanvasComponent.prototype, 'drawOnCanvasFile');
            await component['requestImage']({ imageId: CanvasId.ORIGINAL, files: dataTransfer.files });
            expect(spy).toHaveBeenCalled();
        });

        it('should call window alert for an invalid File', async () => {
            const dataTransfer = new DataTransfer();
            const spy = spyOn(window, 'alert');
            await component['requestImage']({ imageId: CanvasId.ORIGINAL, files: dataTransfer.files });
            expect(spy).toHaveBeenCalledWith('Fichier Invalide. Veuillez sélectionner une image de type BMP - 24 bits de 640 par 480 pixels.');
        });

        it('should call findArea with the right parameters', async () => {
            spyOn<any>(Array.prototype, 'forEach');
            const spy = spyOn<any>(component, 'findArea').and.returnValue([]);
            await component['requestImage']({ imageId: CanvasId.ORIGINAL, files: new DataTransfer().files });
            expect(spy).toHaveBeenCalledWith(CanvasId.ORIGINAL, component['backgrounds']);
        });
    });

    describe('reverseBackground', () => {
        it('should call getImageData on the originalBackground', () => {
            const spy = spyOn(component['originalBackground'], 'getImageData').and.returnValue(fakeImageData);
            component['reverseBackground']();
            expect(spy).toHaveBeenCalled();
        });

        it('should call drawOnCanvasImageData with the right parameters on originalBackground', () => {
            spyOn(component['modifiedBackground'], 'getImageData').and.returnValue(fakeImageData);
            const spy = spyOn(component['originalBackground'], 'drawOnCanvasImageData');
            component['reverseBackground']();
            expect(spy).toHaveBeenCalledWith(fakeImageData);
        });

        it('should call drawOnCanvasImageData with the right parameters on modifiedBackground', () => {
            spyOn(component['originalBackground'], 'getImageData').and.returnValue(fakeImageData);
            const spy = spyOn(component['modifiedBackground'], 'drawOnCanvasImageData');
            component['reverseBackground']();
            expect(spy).toHaveBeenCalledWith(fakeImageData);
        });
    });

    describe('reverseForeground', () => {
        it('should call saveState with CanvasId.BOTH', () => {
            const spy = spyOn<any>(component, 'saveState');
            component['reverseForeground']();
            expect(spy).toHaveBeenCalledWith(CanvasId.BOTH);
        });
        it('should call getImageData on the originalForeground', () => {
            const spy = spyOn(component['originalForeground'], 'getImageData').and.returnValue(fakeImageData);
            component['reverseForeground']();
            expect(spy).toHaveBeenCalled();
        });

        it('should call drawOnCanvasImageData with the right parameters on originalForeground', () => {
            spyOn(component['modifiedForeground'], 'getImageData').and.returnValue(fakeImageData);
            const spy = spyOn(component['originalForeground'], 'drawOnCanvasImageData');
            component['reverseForeground']();
            expect(spy).toHaveBeenCalledWith(fakeImageData);
        });

        it('should call drawOnCanvasImageData with the right parameters on modifiedForeground', () => {
            spyOn(component['originalForeground'], 'getImageData').and.returnValue(fakeImageData);
            const spy = spyOn(component['modifiedForeground'], 'drawOnCanvasImageData');
            component['reverseForeground']();
            expect(spy).toHaveBeenCalledWith(fakeImageData);
        });
    });

    describe('transferForeground', () => {
        it('should call saveState with right parameters', () => {
            const spy = spyOn<any>(component, 'saveState');
            component['transferForeground'](CanvasId.ORIGINAL);
            expect(spy).toHaveBeenCalledWith(CanvasId.MODIFIED);
        });

        it('should call findArea with the right parameters', () => {
            spyOn<any>(Array.prototype, 'forEach');
            const spy = spyOn<any>(component, 'findArea').and.returnValue([]);
            component['transferForeground'](CanvasId.ORIGINAL);
            expect(spy).toHaveBeenCalledWith(CanvasId.MODIFIED, component['foregrounds']);
        });

        it('should call drawOnCanvasImageData on the right Foreground with the right parameters', () => {
            spyOn<any>(component['modifiedForeground'], 'getImageData').and.returnValue(fakeImageData);
            const spy = spyOn<any>(component['originalForeground'], 'drawOnCanvasImageData');
            component['transferForeground'](CanvasId.MODIFIED);
            expect(spy).toHaveBeenCalledWith(fakeImageData);
        });
    });

    describe('selectTool', () => {
        it('should set the value of penSelected', () => {
            component['penSelected'] = false;
            component['selectTool'](true);
            expect(component['penSelected']).toBeTrue();
        });

        it('should call updateToolSize', () => {
            const spy = spyOn<any>(component, 'updateToolSize');
            component['selectTool'](true);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('changeColor', () => {
        it('should call changeColor with right parameters on all foregrounds', () => {
            const ogSpy = spyOn<any>(component['originalForeground'], 'changeColor');
            const modSpy = spyOn<any>(component['modifiedForeground'], 'changeColor');
            component['colorPicker'].currentColor = 'green';
            component['changeColor']();
            expect(ogSpy).toHaveBeenCalledWith('green');
            expect(modSpy).toHaveBeenCalledWith('green');
        });
    });

    describe('saveState', () => {
        it('should call findArea with the right parameters', () => {
            spyOn<any>(Array.prototype, 'forEach');
            const spy = spyOn<any>(component, 'findArea').and.returnValue([]);
            component['saveState'](CanvasId.ORIGINAL);
            expect(spy).toHaveBeenCalledWith(CanvasId.ORIGINAL, component['foregrounds']);
        });

        it('should call saveState on stateSaver with the right parameters', () => {
            spyOn<any>(component['modifiedForeground'], 'getImageData').and.returnValue(fakeImageData);
            const spy = spyOn<any>(component['stateSaver'], 'saveState');
            component['saveState'](CanvasId.MODIFIED);
            expect(spy).toHaveBeenCalledWith(CanvasId.MODIFIED, fakeImageData);
        });
    });

    describe('goBack', () => {
        it('should call getCancelId from stateSaver', () => {
            const spy = spyOn<any>(component['stateSaver'], 'cancelStateId');
            component['goBack']();
            expect(spy).toHaveBeenCalled();
        });

        it('should call findArea with the right parameters', () => {
            const spy = spyOn<any>(component, 'findArea').and.returnValue([]);
            component['goBack']();
            expect(spy).toHaveBeenCalled();
        });

        it('should call reverse on the array', () => {
            const spy = spyOn<any>(Array.prototype, 'reverse').and.returnValue([]);
            component['goBack']();
            expect(spy).toHaveBeenCalled();
        });

        it('should call cancelState with the right parameters', () => {
            spyOn<any>(Array.prototype, 'reverse').and.returnValue([component['originalForeground']]);
            spyOn<any>(component['originalForeground'], 'getImageData').and.returnValue(fakeImageData);
            const spy = spyOn<any>(component['stateSaver'], 'cancelState');
            component['goBack']();
            expect(spy).toHaveBeenCalledWith(fakeImageData);
        });

        it('should call drawNewState with the right parameters', () => {
            spyOn<any>(Array.prototype, 'reverse').and.returnValue([component['originalForeground']]);
            spyOn<any>(component['stateSaver'], 'cancelState').and.returnValue(fakeImageData);
            const spy = spyOn<any>(component, 'drawNewState');
            component['goBack']();
            expect(spy).toHaveBeenCalledWith(component['originalForeground'], fakeImageData);
        });
    });

    describe('goForward', () => {
        it('should call getredoId from stateSaver', () => {
            const spy = spyOn<any>(component['stateSaver'], 'redoStateId');
            component['goForward']();
            expect(spy).toHaveBeenCalled();
        });

        it('should call findArea with the right parameters', () => {
            const spy = spyOn<any>(component, 'findArea').and.returnValue([]);
            component['goForward']();
            expect(spy).toHaveBeenCalled();
        });

        it('should call redoState with the right parameters', () => {
            spyOn<any>(component, 'findArea').and.returnValue([component['originalForeground']]);
            spyOn<any>(component['originalForeground'], 'getImageData').and.returnValue(fakeImageData);
            const spy = spyOn<any>(component['stateSaver'], 'redoState');
            component['goForward']();
            expect(spy).toHaveBeenCalledWith(fakeImageData);
        });

        it('should call drawNewState with the right parameters', () => {
            spyOn<any>(component, 'findArea').and.returnValue([component['originalForeground']]);
            spyOn<any>(component['stateSaver'], 'redoState').and.returnValue(fakeImageData);
            const spy = spyOn<any>(component, 'drawNewState');
            component['goForward']();
            expect(spy).toHaveBeenCalledWith(component['originalForeground'], fakeImageData);
        });
    });

    describe('getMergedImageData', () => {
        it('should call getImageData from right background twice', async () => {
            const spy = spyOn<any>(component['modifiedBackground'], 'getImageData').and.returnValue(fakeImageData);
            await component['getMergedImageData'](CanvasId.MODIFIED);
            expect(spy).toHaveBeenCalledTimes(2);
        });

        it('should call drawAtopCanvas on right background with right parameters', async () => {
            const fakeBitMap = await createImageBitmap(CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT));
            spyOn<any>(component['originalForeground'], 'getImageBitmap').and.returnValue(fakeBitMap);
            const spy = spyOn<any>(component['originalBackground'], 'drawAtopCanvas');
            await component['getMergedImageData'](CanvasId.ORIGINAL);
            expect(spy).toHaveBeenCalledWith(fakeBitMap);
        });
    });

    describe('updateToolSize', () => {
        it('should call selectPen with right parameters for penSelected true', () => {
            component['penSelected'] = true;
            const spy = spyOn<any>(ForegroundCanvasComponent.prototype, 'selectPen');
            component['updateToolSize']();
            expect(spy).toHaveBeenCalledTimes(2);
            expect(spy).toHaveBeenCalledWith(component['penSlider'].value);
        });

        it('should call selectEraser with right parameters for penSelected false', () => {
            component['penSelected'] = false;
            const spy = spyOn<any>(ForegroundCanvasComponent.prototype, 'selectEraser');
            component['updateToolSize']();
            expect(spy).toHaveBeenCalledTimes(2);
            expect(spy).toHaveBeenCalledWith(component['eraserSlider'].value);
        });
    });

    describe('drawNewState', () => {
        it('should call drawOnCanvasImageData on foregroundCanvas for defined newState', () => {
            const spy = spyOn<any>(ForegroundCanvasComponent.prototype, 'drawOnCanvasImageData');
            component['drawNewState'](component['originalForeground'], { data: fakeImageData, id: CanvasId.ORIGINAL });
            expect(spy).toHaveBeenCalledWith(fakeImageData);
        });

        it('should not call drawOnCanvasImageData on foregroundCanvas for undefined newState', () => {
            const spy = spyOn<any>(ForegroundCanvasComponent.prototype, 'drawOnCanvasImageData');
            component['drawNewState'](component['originalForeground'], undefined);
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('keyPressed', () => {
        let keyEvent: KeyboardEvent;

        it('should do nothing if ctrl key is not pressed', () => {
            keyEvent = new KeyboardEvent('keydown', { ctrlKey: false, altKey: false, shiftKey: false, key: 'z' });
            const backSpy = spyOn<any>(component, 'goBack');
            const forwardSpy = spyOn<any>(component, 'goForward');
            component['keyPressed'](keyEvent);
            expect(backSpy).not.toHaveBeenCalled();
            expect(forwardSpy).not.toHaveBeenCalled();
        });

        it('should do nothing if alt key is pressed', () => {
            keyEvent = new KeyboardEvent('keydown', { ctrlKey: true, altKey: true, shiftKey: false, key: 'z' });
            const backSpy = spyOn<any>(component, 'goBack');
            const forwardSpy = spyOn<any>(component, 'goForward');
            component['keyPressed'](keyEvent);
            expect(backSpy).not.toHaveBeenCalled();
            expect(forwardSpy).not.toHaveBeenCalled();
        });

        it('should call goBack for valid keys z', () => {
            keyEvent = new KeyboardEvent('keydown', { ctrlKey: true, altKey: false, shiftKey: false, key: 'z' });
            const backSpy = spyOn<any>(component, 'goBack');
            component['keyPressed'](keyEvent);
            expect(backSpy).toHaveBeenCalled();
        });

        it('should call goBack for valid keys Z', () => {
            keyEvent = new KeyboardEvent('keydown', { ctrlKey: true, altKey: false, shiftKey: false, key: 'Z' });
            const backSpy = spyOn<any>(component, 'goBack');
            component['keyPressed'](keyEvent);
            expect(backSpy).toHaveBeenCalled();
        });

        it('should call goForward for valid keys Z and shift pressed', () => {
            keyEvent = new KeyboardEvent('keydown', { ctrlKey: true, altKey: false, shiftKey: true, key: 'Z' });
            const backSpy = spyOn<any>(component, 'goForward');
            component['keyPressed'](keyEvent);
            expect(backSpy).toHaveBeenCalled();
        });
    });

    afterEach(() => {
        fixture.destroy();
    });
});
