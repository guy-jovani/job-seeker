import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent {
  @Input() messages: string[];
  @Output() closeAlert = new EventEmitter<void>();

  onClose() {
    this.closeAlert.emit();
  }

  @HostListener('document:keypress') enterKeyPress(eventData: Event) { // depracated and needs to be replaced
    this.onClose();
  }
}
