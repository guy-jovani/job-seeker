import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'app/auth/auth.guard';
import { DetailsUserComponent } from './details-user/details-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { PositionComponent } from 'app/position/position.component';
import { EditPositionComponent } from 'app/position/edit-position/edit-position.component';
import { DetailsPositionComponent } from 'app/position/details-position/details-position.component';
import { EditPositionGuard } from 'app/position/edit-position/edit-position.guard';



const routes: Routes = [
  {
    path: 'my-details', component: DetailsUserComponent, canActivate: [AuthGuard],
    // children: [
    //   {
    //     path: 'edit', component: EditUserComponent
    //   },
    // ]
  },
  {
    path: 'my-details/edit', component: EditUserComponent, canActivate: [AuthGuard],
  },
  {
    path: 'my-positions', component: PositionComponent, canActivate: [AuthGuard],
    // children: [
      // {
      //   path: 'create', component: EditPositionComponent
      // },
      // {
      //   path: ':index', component: DetailsPositionComponent
      // },
      // {
      //   path: ':index/edit', component: EditPositionComponent
      // },
    // ]
  },
  {
    path: 'my-positions/create', component: EditPositionComponent, canActivate: [AuthGuard, EditPositionGuard]
  },
  {
    path: 'my-positions/:index', component: DetailsPositionComponent, canActivate: [AuthGuard]
  },
  {
    path: 'my-positions/:index/edit', component: EditPositionComponent, canActivate: [AuthGuard, EditPositionGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
