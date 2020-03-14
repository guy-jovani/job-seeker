import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss']
})
export class MessageBoxComponent {
  @Input() messages: string[];
  @Output() closeMessages = new EventEmitter<void>();

  onClose() {
    this.closeMessages.emit();
  }


}
