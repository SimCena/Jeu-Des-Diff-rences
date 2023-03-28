import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LimitedScoreInfo } from '@common/games';

@Component({
    selector: 'app-congratulations-dialog-limited',
    templateUrl: './congratulations-dialog-limited.component.html',
    styleUrls: ['./congratulations-dialog-limited.component.scss'],
})
export class CongratulationsDialogLimitedComponent {
    constructor(public dialogRef: MatDialogRef<CongratulationsDialogLimitedComponent>, @Inject(MAT_DIALOG_DATA) public scoreInfo: LimitedScoreInfo) {}
}
