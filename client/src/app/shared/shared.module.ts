import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperModule } from 'ngx-image-cropper';

import { DropdownDirective } from './dropdown.directive';
import { AlertComponent } from './alert/alert.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { AutoCompleteComponent } from './auto-complete/auto-complete.component';
import { TrimPipe } from './trim.pipe';
import { CutPipe } from './cut.pipe';
import { ScrollToBottomDirective } from './scroll-to-bottom.directive';
import { BackButtonComponent } from './back-button/back-button.component';
import { MessageBoxComponent } from './message-box/message-box.component';
import { ImageCropperComponent } from './image-cropper/image-cropper.component';



@NgModule({
  declarations: [
    DropdownDirective,
    AlertComponent,
    LoadingSpinnerComponent,
    AutoCompleteComponent,
    TrimPipe,
    CutPipe,
    ScrollToBottomDirective,
    BackButtonComponent,
    MessageBoxComponent,
    ImageCropperComponent,
  ],
  imports: [CommonModule, ImageCropperModule],
  exports: [
    DropdownDirective,
    AlertComponent,
    LoadingSpinnerComponent,
    CommonModule,
    AutoCompleteComponent,
    TrimPipe,
    CutPipe,
    ScrollToBottomDirective,
    BackButtonComponent,
    MessageBoxComponent,
    ImageCropperComponent
  ]
})
export class SharedModule {}
