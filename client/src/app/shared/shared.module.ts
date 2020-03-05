import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DropdownDirective } from './dropdown.directive';
import { AlertComponent } from './alert/alert.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { TrimPipe } from './trim.pipe';
import { CutPipe } from './cut.pipe';
import { ScrollToBottomDirective } from './scroll-to-bottom.directive';

@NgModule({
  declarations: [
    DropdownDirective,
    AlertComponent,
    LoadingSpinnerComponent,
    SearchBarComponent,
    TrimPipe,
    CutPipe,
    ScrollToBottomDirective
  ],
  imports: [CommonModule],
  exports: [
    DropdownDirective,
    AlertComponent,
    LoadingSpinnerComponent,
    CommonModule,
    SearchBarComponent,
    TrimPipe,
    CutPipe,
    ScrollToBottomDirective
  ]
})
export class SharedModule {}
