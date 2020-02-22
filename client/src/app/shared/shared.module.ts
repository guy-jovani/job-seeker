
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DropdownDirective } from './dropdown.directive';
import { AlertComponent } from './alert/alert.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { BackButtonComponent } from './back-button/back-button.component';
import { MessageBoxComponent } from './message-box/message-box.component';




@NgModule({
  declarations: [
    DropdownDirective,
    AlertComponent,
    LoadingSpinnerComponent,
    BackButtonComponent,
    MessageBoxComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DropdownDirective,
    AlertComponent,
    LoadingSpinnerComponent,
    CommonModule,
    BackButtonComponent,
    MessageBoxComponent
  ]
})
export class SharedModule {}
