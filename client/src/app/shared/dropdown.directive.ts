import { Directive, ElementRef, Renderer2, HostListener, HostBinding } from '@angular/core';

@Directive({
  selector: '[appDropdown]'
})
export class DropdownDirective {
  open = false;
  constructor(private elementRef: ElementRef,
              private renderer: Renderer2) { }

  @HostListener('click') onClick(eventData: Event){
    if(this.open){
      this.renderer.removeClass(this.elementRef.nativeElement, 'open');
    } else {
      this.renderer.addClass(this.elementRef.nativeElement, 'open');
    }
    this.open = !this.open;
  }

  // @HostBinding('class.open') isOpen = false;

  // @HostListener('click') toggleOpen(){
  //   this.isOpen = !this.isOpen;
  // }

}
