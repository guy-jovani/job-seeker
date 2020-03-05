import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from 'app/auth/auth.guard';
import { ChatComponent } from './chat.component';
import { ChatResolverService } from './chat-resolver.service';


const routes: Routes = [
  {
    path: 'chat', canActivate: [AuthGuard], component: ChatComponent,
    resolve: [ChatResolverService]
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule { }



















