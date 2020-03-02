import { NgModule } from '@angular/core';
import { MessagesComponent } from './messages.component';
import { MessagesRoutingModule } from './messages-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [MessagesComponent],
  imports: [MessagesRoutingModule, SharedModule, FormsModule],
  exports: []
})
export class MessagesModule {}
