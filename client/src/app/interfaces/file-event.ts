import { CanvasId } from '@app/models/canvas-id';
export interface FileEvent {
    imageId: CanvasId;
    files: FileList;
}
