import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from 'app/auth/auth.guard';
import { MessagesComponent } from './messages.component';


const routes: Routes = [
  {
    path: 'messages', canActivate: [AuthGuard], component: MessagesComponent,
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessagesRoutingModule { }



















