import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LimitedInterfaceComponent } from '@app/components/limited-interface/limited-interface.component';
import { MultiplayerInterfaceComponent } from '@app/components/multiplayer-interface/multiplayer-interface.component';
import { SoloInterfaceComponent } from '@app/components/solo-interface/solo-interface.component';
import { AdministrationPageComponent } from '@app/pages/administration-page/administration-page.component';
import { BaseGamePageComponent } from '@app/pages/base-game-page/base-game-page.component';
import { GameCreationPageComponent } from '@app/pages/game-creation-page/game-creation-page.component';
import { LimitedWaitingRoomPageComponent } from '@app/pages/limited-waiting-room-page/limited-waiting-room-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';
import { WaitingRoomPageComponent } from '@app/pages/waiting-room-page/waiting-room-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent, title: 'LOG2990' },
    { path: 'select', component: SelectionPageComponent },
    { path: 'admin', component: AdministrationPageComponent },
    { path: 'creation', component: GameCreationPageComponent },
    {
        path: 'play',
        component: BaseGamePageComponent,
        children: [
            { path: '', redirectTo: '/select', pathMatch: 'full' },
            { path: 'classic/solo', component: SoloInterfaceComponent },
            { path: 'classic/multi', component: MultiplayerInterfaceComponent },
            { path: 'limited', component: LimitedInterfaceComponent },
            { path: '**', redirectTo: '/select' },
        ],
    },
    { path: 'waiting/classic', component: WaitingRoomPageComponent },
    { path: 'waiting/limited', component: LimitedWaitingRoomPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
