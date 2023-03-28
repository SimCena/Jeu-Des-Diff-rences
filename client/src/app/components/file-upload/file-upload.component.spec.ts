import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasId } from '@app/models/canvas-id';
import { AppMaterialModule } from '@app/modules/material.module';
import { FileUploadComponent } from './file-upload.component';

describe('FileUploadComponent', () => {
    let component: FileUploadComponent;
    let fixture: ComponentFixture<FileUploadComponent>;
    let imageFile: File;
    let input: HTMLInputElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FileUploadComponent],
            imports: [AppMaterialModule],
        }).compileComponents();

        fixture = TestBed.createComponent(FileUploadComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        await fetch(new Request('../../assets/images/test_complex_image.bmp'))
            .then(async (response) => response.blob())
            .then((blob) => (imageFile = new File([blob], 'test_image.bmp', { type: 'image/bmp' })));

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(imageFile);
        input = document.createElement('input');
        input.type = 'file';
        input.files = dataTransfer.files;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('notifyUpload', () => {
        it('should emit an output for valid input', () => {
            const spy = spyOn(component.fileUpload, 'emit');
            component['notifyUpload'](input);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(spy).toHaveBeenCalledOnceWith({ imageId: component.canvasId, files: input.files! });
        });

        it('should not emit anything for an invalid input', () => {
            const spy = spyOn(component.fileUpload, 'emit');
            component['notifyUpload'](document.createElement('input'));
            expect(spy).not.toHaveBeenCalled();
        });

        it('should not emit anything for a fileList of length 0', () => {
            const spy = spyOn(component.fileUpload, 'emit');
            const dataTransfer = new DataTransfer();
            input.files = dataTransfer.files;
            component['notifyUpload'](input);
            expect(spy).not.toHaveBeenCalled();
        });

        it('should erase the value of input', () => {
            component['notifyUpload'](input);
            expect(input.value).toBe('');
        });
    });

    describe('getId', () => {
        it('should return validId from canvasId', () => {
            component.canvasId = CanvasId.ORIGINAL;
            expect(component['getId']()).toBe('input0');
            component.canvasId = CanvasId.MODIFIED;
            expect(component['getId']()).toBe('input1');
            component.canvasId = CanvasId.BOTH;
            expect(component['getId']()).toBe('input2');
        });
    });
});
