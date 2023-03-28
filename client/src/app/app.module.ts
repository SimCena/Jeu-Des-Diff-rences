import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { NgxThreeModule } from 'ngx-three';
import { BackgroundCanvasComponent } from './components/background-canvas/background-canvas.component';
import { BackgroundComponent } from './components/background/background.component';
import { ChatBoxComponent } from './components/chat-box/chat-box.component';
import { CheatingCanvasesComponent } from './components/cheating-canvases/cheating-canvases.component';
import { ColorPickerComponent } from './components/color-picker/color-picker.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { CongratulationsDialogLimitedComponent } from './components/congratulations-dialog-limited/congratulations-dialog-limited.component';
import { CongratulationsDialogComponent } from './components/congratulations-dialog/congratulations-dialog.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { ForegroundCanvasComponent } from './components/foreground-canvas/foreground-canvas.component';
import { GameCardsComponent } from './components/game-cards/game-cards.component';
import { GameConstantsDialogComponent } from './components/game-constants-dialog/game-constants-dialog.component';
import { GameViewerComponent } from './components/game-viewer/game-viewer.component';
import { ImageDifferenceDialogComponent } from './components/image-difference-dialog/image-difference-dialog.component';
import { KickedDialogComponent } from './components/kicked-dialog/kicked-dialog.component';
import { LimitedGameDialogComponent } from './components/limited-game-dialog/limited-game-dialog.component';
import { LimitedInterfaceComponent } from './components/limited-interface/limited-interface.component';
import { MultiplayerInterfaceComponent } from './components/multiplayer-interface/multiplayer-interface.component';
import { NameInputDialogComponent } from './components/name-input-dialog/name-input-dialog.component';
import { SoloInterfaceComponent } from './components/solo-interface/solo-interface.component';
import { AdministrationPageComponent } from './pages/administration-page/administration-page.component';
import { BaseGamePageComponent } from './pages/base-game-page/base-game-page.component';
import { GameCreationPageComponent } from './pages/game-creation-page/game-creation-page.component';
import { LimitedWaitingRoomPageComponent } from './pages/limited-waiting-room-page/limited-waiting-room-page.component';
import { SelectionPageComponent } from './pages/selection-page/selection-page.component';
import { WaitingRoomPageComponent } from './pages/waiting-room-page/waiting-room-page.component';
import { CommunicationService } from './services/communication.service';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        MainPageComponent,
        SelectionPageComponent,
        AdministrationPageComponent,
        GameCardsComponent,
        GameCreationPageComponent,
        FileUploadComponent,
        ImageDifferenceDialogComponent,
        GameViewerComponent,
        NameInputDialogComponent,
        BackgroundCanvasComponent,
        CongratulationsDialogComponent,
        CongratulationsDialogLimitedComponent,
        ChatBoxComponent,
        WaitingRoomPageComponent,
        ForegroundCanvasComponent,
        ColorPickerComponent,
        BackgroundComponent,
        BaseGamePageComponent,
        MultiplayerInterfaceComponent,
        SoloInterfaceComponent,
        KickedDialogComponent,
        GameConstantsDialogComponent,
        CheatingCanvasesComponent,
        LimitedInterfaceComponent,
        LimitedGameDialogComponent,
        LimitedWaitingRoomPageComponent,
        ConfirmationDialogComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        NgxThreeModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    providers: [CommunicationService],
    bootstrap: [AppComponent],
})
export class AppModule {}
