import { Component, ViewChild, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { ImageVerificationService } from '@app/services/image-verification.service';
import { CommunicationService } from '@app/services/communication.service';
import { FileEvent } from '@app/interfaces/file-event';
import { CanvasId } from '@app/models/canvas-id';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ImageDifferenceDialogComponent } from '@app/components/image-difference-dialog/image-difference-dialog.component';
import { GameData } from '@common/game-data';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ColorPickerComponent } from '@app/components/color-picker/color-picker.component';
import { StateSaverService } from '@app/services/state-saver.service';
import { State } from '@common/state';
import { BackgroundCanvasComponent } from '@app/components/background-canvas/background-canvas.component';
import { ForegroundCanvasComponent } from '@app/components/foreground-canvas/foreground-canvas.component';
import { IdentifiableCanvas } from '@app/interfaces/identifiable-canvas';
import { DEFAULT_DIFFERENCE_RADIUS, DEFAULT_TOOL_WIDTH, MAX_GAME_NAME_LENGTH } from '@app/constants/game';
import { SocketService } from '@app/services/socket.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Difference } from '@common/games';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('originalForeground') private originalForeground: ForegroundCanvasComponent;
    @ViewChild('modifiedForeground') private modifiedForeground: ForegroundCanvasComponent;
    @ViewChild('originalBackground') private originalBackground: BackgroundCanvasComponent;
    @ViewChild('modifiedBackground') private modifiedBackground: BackgroundCanvasComponent;
    @ViewChild('color') private colorPicker: ColorPickerComponent;

    protected penSelected: boolean;
    protected radius: number;
    protected loading: boolean;
    protected penSlider: FormControl;
    protected eraserSlider: FormControl;
    protected gameName: FormControl;

    private foregrounds: ForegroundCanvasComponent[];
    private backgrounds: BackgroundCanvasComponent[];

    // eslint-disable-next-line max-params
    constructor(
        private imageVerificationService: ImageVerificationService,
        private communicationService: CommunicationService,
        private matDialogService: MatDialog,
        private snackBar: MatSnackBar,
        private router: Router,
        private stateSaver: StateSaverService,
        private socketService: SocketService,
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
    ) {
        this.matIconRegistry.addSvgIcon('eraser', this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/eraser.svg'));
        this.penSelected = true;
        this.radius = DEFAULT_DIFFERENCE_RADIUS;
        this.loading = false;
        this.penSlider = new FormControl(DEFAULT_TOOL_WIDTH);
        this.eraserSlider = new FormControl(DEFAULT_TOOL_WIDTH);
        this.gameName = new FormControl('', [Validators.required, Validators.maxLength(MAX_GAME_NAME_LENGTH)]);
        document.body.onkeydown = (event: KeyboardEvent): void => {
            this.keyPressed(event);
        };
    }

    ngOnInit(): void {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }
    }

    ngAfterViewInit(): void {
        this.foregrounds = [this.originalForeground, this.modifiedForeground];
        this.backgrounds = [this.originalBackground, this.modifiedBackground];
        this.updateToolSize();
    }

    ngOnDestroy(): void {
        this.stateSaver.setStateSaver();
    }

    protected async requestImage(fileEvent: FileEvent) {
        this.findArea(fileEvent.imageId, this.backgrounds).forEach(async (area) => {
            const fileListCopy: FileList = Object.assign({}, fileEvent.files);
            if (await this.imageVerificationService.verifyImage(fileEvent.files[0])) {
                fileEvent.files = fileListCopy;
                area.drawOnCanvasFile(fileEvent.files[0]);
            } else {
                window.alert('Fichier Invalide. Veuillez sélectionner une image de type BMP - 24 bits de 640 par 480 pixels.');
            }
        });
    }

    protected eraseBackgroundImage(canvasId: CanvasId): void {
        this.findArea(canvasId, this.backgrounds).forEach((area) => {
            area.eraseCanvas();
        });
    }

    protected eraseForegroundImage(canvasId: CanvasId): void {
        this.saveState(canvasId);
        this.findArea(canvasId, this.foregrounds).forEach((area) => {
            area.eraseCanvas();
        });
    }

    protected reverseBackground(): void {
        const savedOriginal: ImageData = this.originalBackground.getImageData();
        this.originalBackground.drawOnCanvasImageData(this.modifiedBackground.getImageData());
        this.modifiedBackground.drawOnCanvasImageData(savedOriginal);
    }

    protected reverseForeground(): void {
        this.saveState(CanvasId.BOTH);
        const savedOriginal: ImageData = this.originalForeground.getImageData();
        this.originalForeground.drawOnCanvasImageData(this.modifiedForeground.getImageData());
        this.modifiedForeground.drawOnCanvasImageData(savedOriginal);
    }

    protected transferForeground(canvasId: CanvasId): void {
        this.saveState(1 - canvasId);
        this.findArea(canvasId, this.foregrounds).forEach((area) => {
            this.foregrounds[1 - canvasId].drawOnCanvasImageData(area.getImageData());
        });
    }

    protected selectTool(penSelected: boolean): void {
        this.penSelected = penSelected;
        this.updateToolSize();
    }

    protected changeColor(): void {
        this.foregrounds.forEach((area) => area.changeColor(this.colorPicker.currentColor));
    }

    protected getCanvasIdEnum(): typeof CanvasId {
        return CanvasId;
    }

    protected saveState(canvasId: CanvasId): void {
        this.findArea(canvasId, this.foregrounds).forEach((area) => {
            this.stateSaver.saveState(canvasId, area.getImageData());
        });
    }

    protected goBack(): void {
        const canvasId = this.stateSaver.cancelStateId();
        this.findArea(canvasId, this.foregrounds)
            .reverse()
            .forEach((area) => {
                const newState = this.stateSaver.cancelState(area.getImageData());
                this.drawNewState(area, newState);
            });
    }

    protected goForward(): void {
        const canvasId = this.stateSaver.redoStateId();
        this.findArea(canvasId, this.foregrounds).forEach((area) => {
            const newState = this.stateSaver.redoState(area.getImageData());
            this.drawNewState(area, newState);
        });
    }

    protected async saveGame(): Promise<void> {
        if (this.gameName.value !== '') {
            this.snackBar.open('Sauvegarde du jeu en cours...', undefined, { duration: 2000 });
            const params: GameData | void = await this.getDifferenceImage(true);
            if (params) {
                params.gameName = this.gameName.value;
                this.communicationService.putGame(params).subscribe((confirmation: boolean) => {
                    if (confirmation) {
                        this.socketService.createdGame();
                        this.snackBar.open('Jeu sauvegardé!', undefined, { duration: 2000 });
                    } else {
                        this.snackBar.open('Erreur 503 - Le jeu ne peut pas être sauvegardé présentement', undefined, { duration: 3500 });
                    }
                    this.loading = false;
                    this.router.navigate(['/admin']);
                });
            }
        } else {
            this.snackBar.open('Veuillez entrer un nom pour le jeu.', undefined, { duration: 2000 });
            this.gameName.markAsTouched();
        }
    }

    protected async getMergedImageData(canvasId: CanvasId): Promise<ImageData> {
        const originalBackground: ImageData = this.backgrounds[canvasId].getImageData();
        this.backgrounds[canvasId].drawAtopCanvas(await this.foregrounds[canvasId].getImageBitmap());
        const mergedData = this.backgrounds[canvasId].getImageData();
        this.backgrounds[canvasId].drawOnCanvasImageData(originalBackground);
        return mergedData;
    }

    protected async getDifferenceImage(saving: boolean): Promise<GameData | void> {
        this.loading = true;
        const images: ImageData[] = [await this.getMergedImageData(CanvasId.ORIGINAL), await this.getMergedImageData(CanvasId.MODIFIED)];
        return new Promise<GameData | void>((resolve) => {
            this.communicationService.postDifferenceImage({ images, radius: this.radius }).subscribe((differenceImage: Difference[]) => {
                this.openImageDifferenceDialog(differenceImage)
                    .afterClosed()
                    .subscribe((validDifferenceCount: boolean) => {
                        if (!saving) this.loading = false;
                        resolve(
                            this.determineSavedImageParam(validDifferenceCount, {
                                gameName: this.gameName.value,
                                originalImage: images[CanvasId.ORIGINAL],
                                modifiedImage: images[CanvasId.MODIFIED],
                                differenceImage,
                            }),
                        );
                    });
            });
        });
    }

    protected validateGameName(): void {
        this.gameName.markAllAsTouched();
        this.gameName.updateValueAndValidity();
    }

    protected getError(): string {
        if (this.gameName.hasError('required')) return 'Nom de jeu obligatoire';
        return 'Doit être compris entre 1 et 30 caractères';
    }

    private updateToolSize(): void {
        this.foregrounds.forEach((area) => {
            return this.penSelected ? area.selectPen(this.penSlider.value) : area.selectEraser(this.eraserSlider.value);
        });
    }

    private findArea<T extends IdentifiableCanvas>(imageId: CanvasId | undefined, list: T[]): T[] {
        return list.filter((area) => imageId === area.canvasId || imageId === CanvasId.BOTH);
    }

    private drawNewState(area: ForegroundCanvasComponent, newState: State | undefined): void {
        if (newState) area.drawOnCanvasImageData(newState.data);
    }

    private determineSavedImageParam(validDifferenceCount: boolean, params: GameData): GameData | undefined {
        if (!validDifferenceCount) {
            this.loading = false;
            return undefined;
        }
        return params;
    }

    private openImageDifferenceDialog(differenceImage: Difference[]): MatDialogRef<ImageDifferenceDialogComponent> {
        return this.matDialogService.open(ImageDifferenceDialogComponent, {
            data: {
                differenceImage,
            },
            enterAnimationDuration: '500ms',
            exitAnimationDuration: '500ms',
            disableClose: true,
        });
    }

    private keyPressed(event: KeyboardEvent): void {
        if (event.ctrlKey && !event.altKey && (event.key === 'Z' || event.key === 'z')) {
            if (event.shiftKey) {
                this.goForward();
            } else {
                this.goBack();
            }
        }
    }
}
