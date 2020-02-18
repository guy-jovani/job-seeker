import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'app/auth/auth.guard';
import { DetailsUserComponent } from './details-user/details-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { PositionComponent } from 'app/position/position.component';
import { EditPositionComponent } from 'app/position/edit-position/edit-position.component';
import { DetailsPositionComponent } from 'app/position/details-position/details-position.component';



const routes: Routes = [
  {
    path: 'my-details', component: DetailsUserComponent, canActivate: [AuthGuard],
    children: [
      {
        path: 'edit', component: EditUserComponent
      },
    ]
  },
  {
    path: 'my-positions', component: PositionComponent, canActivate: [AuthGuard],
    children: [
      {
        path: 'create', component: EditPositionComponent
      },
      {
        path: ':index', component: DetailsPositionComponent
      },
      {
        path: ':index/edit', component: EditPositionComponent
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
