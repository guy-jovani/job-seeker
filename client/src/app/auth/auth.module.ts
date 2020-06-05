

import { NgModule } from '@angular/core';


import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { GetNewPasswordComponent } from './reset-password/get-new-password/get-new-password.component';
import { SharedModule } from 'app/shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';



@NgModule({
  declarations: [
    AuthComponent,
    ResetPasswordComponent,
    GetNewPasswordComponent,
  ],
  imports: [
    SharedModule,
    AuthRoutingModule,
  ],
})
export class AuthModule { }
