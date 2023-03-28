import { Injectable } from '@angular/core';
import { BIT_DEPTH, BMP_BIT_DEPTH_OFFSET, BMP_HEIGHT_OFFSET, BMP_WIDTH_OFFSET, IMAGE_HEIGHT, IMAGE_TYPE, IMAGE_WIDTH } from '@common/constants/image';

@Injectable({
    providedIn: 'root',
})
export class ImageVerificationService {
    async verifyImage(file: File): Promise<boolean> {
        return new Promise((resolve) => {
            const fileReader: FileReader = new FileReader();

            fileReader.addEventListener('load', async () => {
                resolve(await this.readRawImageData(new DataView(fileReader.result as ArrayBuffer)));
            });

            if (file.type !== IMAGE_TYPE) {
                resolve(false);
            } else {
                fileReader.readAsArrayBuffer(file);
            }
        });
    }

    private async readRawImageData(dataViewer: DataView): Promise<boolean> {
        if (Math.abs(dataViewer.getInt32(BMP_WIDTH_OFFSET, true)) !== IMAGE_WIDTH) return false;
        if (Math.abs(dataViewer.getInt32(BMP_HEIGHT_OFFSET, true)) !== IMAGE_HEIGHT) return false;
        if (Math.abs(dataViewer.getUint16(BMP_BIT_DEPTH_OFFSET, true)) !== BIT_DEPTH) return false;
        return true;
    }
}
