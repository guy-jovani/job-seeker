import { NgModule } from '@angular/core';
import { ChatComponent } from './chat.component';
import { ChatRoutingModule } from './chat-routing.module';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
  declarations: [ChatComponent],
  imports: [ChatRoutingModule, SharedModule],
  exports: []
})
export class ChatModule {}
