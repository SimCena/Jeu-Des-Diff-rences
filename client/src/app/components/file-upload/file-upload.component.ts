import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FileEvent } from '@app/interfaces/file-event';
import { CanvasId } from '@app/models/canvas-id';

@Component({
    selector: 'app-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent {
    @Input() labelTxt: string | undefined;
    @Input() canvasId: CanvasId;
    @Output() fileUpload: EventEmitter<FileEvent>;

    constructor() {
        this.fileUpload = new EventEmitter<FileEvent>();
    }

    protected notifyUpload(eventTarget: EventTarget): void {
        const input: HTMLInputElement = eventTarget as HTMLInputElement;
        if (input.files !== null && input.files.length !== 0) {
            this.fileUpload.emit({ imageId: this.canvasId, files: input.files });
        }
        input.value = '';
    }

    protected getId(): string {
        return 'input' + this.canvasId;
    }
}
