import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SignupComponent } from './signup/signup.component';
import { GetNewPasswordComponent } from './reset-password/get-new-password/get-new-password.component';
import { LoginComponent } from './login/login.component';




const routes: Routes = [
  {
    path: 'login', component: LoginComponent,
  },
  {
    path: 'reset', component: ResetPasswordComponent,
  },
  {
    path: 'signup', component: SignupComponent, data : {companySignup : false}
  },
  {
    path: 'reset-password/:token', component: GetNewPasswordComponent
  },
  {
    path: 'signup/company', component: SignupComponent, data : {companySignup : true}
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }



















