import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { GetNewPasswordComponent } from './reset-password/get-new-password/get-new-password.component';
import { AuthComponent } from './auth.component';




const routes: Routes = [
  {
    path: 'login', component: AuthComponent,
    data: { authAction : 'login' }
  },
  {
    path: 'reset', component: ResetPasswordComponent,
  },
  {
    path: 'signup', component: AuthComponent,
    data: { authAction : 'signup' }
  },
  {
    path: 'reset-password/:token', component: GetNewPasswordComponent
  },
  {
    path: 'signup/company', component: AuthComponent,
    data: { authAction : 'companySignup' }
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }



















