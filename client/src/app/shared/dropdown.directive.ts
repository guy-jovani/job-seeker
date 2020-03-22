import { Directive, ElementRef, Renderer2, HostListener } from '@angular/core';

@Directive({
  selector: '[appDropdown]'
})
export class DropdownDirective {
  open = false;
  clicked = 0;
  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  @HostListener('click') onClose() {
    if (!this.open) {
      this.renderer.addClass(this.elementRef.nativeElement, 'open');
      this.open = !this.open;
    }
    this.clicked++;
  }

  @HostListener('document:click', ['$event']) onOpen(event) {
    if (this.open && (this.clicked >= 2 || this.elementRef.nativeElement.firstChild !== event.target)) {
      this.renderer.removeClass(this.elementRef.nativeElement, 'open');
      this.open = !this.open;
      this.clicked = 0;
    }
  }
}
