import { Component, Input, ViewChild, ElementRef, Renderer2, Output, EventEmitter } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss']
})
export class ImageCropperComponent {
  imageChangedEvent = null;
  croppedImage: any = '';
  confirmedImage = false;
  failUpload = false;

  @Input() roundCropper: boolean;
  @Input() imagePreview = '';
  @Input() aspectRatio: string;
  @ViewChild('cropContainer') cropContainer: ElementRef;
  @ViewChild('filePicker') filePicker: ElementRef;
  @Output() confirmedImageEvent = new EventEmitter<{ file: File, stringFile: string }>();

  constructor(private renderer: Renderer2) {}


  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    if (event.target.files.length) {
      this.renderer.removeClass(this.cropContainer.nativeElement, 'hide');
      this.confirmedImage = false;
      this.failUpload = false;
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    this.imagePreview = event.base64;
  }

  loadImageFailed() {
    this.onCancelCrop();
    this.failUpload = true;
  }

  onCancelCrop() {
    this.renderer.addClass(this.cropContainer.nativeElement, 'hide');
    this.onRemoveImage();
  }

  onRemoveImage() {
    this.confirmedImage = false;
    this.filePicker.nativeElement.value = '';
    this.imageChangedEvent = null;
    this.croppedImage = '';
    this.imagePreview = '';
    this.confirmedImageEvent.emit({ file: null, stringFile: '' });
  }

  onConfirmCrop() {
    this.confirmedImage = true;
    this.renderer.addClass(this.cropContainer.nativeElement, 'hide');
    const fileBeforeCrop = this.imageChangedEvent.target.files[0];
    const finalCroppedImage = new File([this.base64ImageToBlob(this.croppedImage)],
                                        fileBeforeCrop.name,
                                        { type: fileBeforeCrop.type } );
    this.confirmedImageEvent.emit({ file: finalCroppedImage, stringFile: this.croppedImage });
  }

  base64ImageToBlob(str) {
    // extract content type and base64 payload from original string
    const pos = str.indexOf(';base64,');
    const type = str.substring(5, pos);
    const b64 = str.substr(pos + 8);

    // decode base64
    const imageContent = atob(b64);

    // create an ArrayBuffer and a view (as unsigned 8-bit)
    const buffer = new ArrayBuffer(imageContent.length);
    const view = new Uint8Array(buffer);

    // fill the view, using the decoded base64
    for(let n = 0; n < imageContent.length; n++) {
      view[n] = imageContent.charCodeAt(n);
    }

    // convert ArrayBuffer to Blob
    const blob = new Blob([buffer], { type });

    return blob;
  }

}
