

import { NgModule } from '@angular/core';

import { CompanySignupComponent } from './company-signup/company-signup.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { GetNewPasswordComponent } from './reset-password/get-new-password/get-new-password.component';
import { SharedModule } from 'app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';





@NgModule({
  declarations: [
    CompanySignupComponent,
    SignupComponent,
    LoginComponent,
    ResetPasswordComponent,
    GetNewPasswordComponent
  ],
  imports: [
    SharedModule,
    ReactiveFormsModule,
    AuthRoutingModule,

  ],
})
export class AuthModule { }
