import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DropdownDirective } from './dropdown.directive';
import { AlertComponent } from './alert/alert.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { SearchBarComponent } from './search-bar/search-bar.component';

@NgModule({
  declarations: [
    DropdownDirective,
    AlertComponent,
    LoadingSpinnerComponent,
    SearchBarComponent
  ],
  imports: [CommonModule],
  exports: [
    DropdownDirective,
    AlertComponent,
    LoadingSpinnerComponent,
    CommonModule,
    SearchBarComponent
  ]
})
export class SharedModule {}
