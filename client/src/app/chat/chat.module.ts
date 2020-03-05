import { NgModule } from '@angular/core';
import { ChatComponent } from './chat.component';
import { ChatRoutingModule } from './chat-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ChatComponent],
  imports: [ChatRoutingModule, SharedModule, FormsModule],
  exports: []
})
export class ChatModule {}
