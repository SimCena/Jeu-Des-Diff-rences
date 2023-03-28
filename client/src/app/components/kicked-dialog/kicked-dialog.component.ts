import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { KickedMessageType } from '@app/models/kicked-message-type';

@Component({
    selector: 'app-kicked-dialog',
    templateUrl: './kicked-dialog.component.html',
    styleUrls: ['./kicked-dialog.component.scss'],
})
export class KickedDialogComponent {
    protected type: typeof KickedMessageType = KickedMessageType;
    constructor(public dialogRef: MatDialogRef<KickedDialogComponent>, @Inject(MAT_DIALOG_DATA) public messageType: KickedMessageType) {}
}
