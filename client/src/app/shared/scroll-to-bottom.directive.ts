






import { Directive, ElementRef, AfterViewChecked } from '@angular/core';

@Directive({
  selector: '[appScrollToBottom]'
})
export class ScrollToBottomDirective implements AfterViewChecked {
  constructor(private elRef: ElementRef) {}
  ngAfterViewChecked() {
    this.elRef.nativeElement.scroll({
      top: this.elRef.nativeElement.scrollHeight,
      behavior: 'auto'
    });
  }
}
