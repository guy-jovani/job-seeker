import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { GetNewPasswordComponent } from './reset-password/get-new-password/get-new-password.component';
import { AuthComponent } from './auth.component';
import { NotLoggedGuard } from './not-logged.guard';




const routes: Routes = [
  {
    path: 'login', component: AuthComponent,
    data: { authAction : 'login' },
    canActivate: [NotLoggedGuard]
  },
  {
    path: 'reset', component: ResetPasswordComponent,
    canActivate: [NotLoggedGuard]
  },
  {
    path: 'signup', component: AuthComponent,
    data: { authAction : 'signup' },
    canActivate: [NotLoggedGuard]
  },
  {
    path: 'reset-password/:token', component: GetNewPasswordComponent,
    canActivate: [NotLoggedGuard]
  },
  {
    path: 'signup/company', component: AuthComponent,
    data: { authAction : 'companySignup' },
    canActivate: [NotLoggedGuard]
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }



















