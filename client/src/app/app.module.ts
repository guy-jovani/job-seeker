import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { ErrorsComponent } from './errors/errors.component';
import { Page404Component } from './errors/page404/page404.component';
import { HomeComponent } from './home/home.component';
import { EmployeeEffects } from './employees/store/employee.effects';
import { AuthEffects } from './auth/store/auth.effects';

import * as fromApp from './store/app.reducer';
import { CompanyEffects } from './company/store/company.effects';
import { EmployeesModule } from './employees/employees.module';
import { CompanyModule } from './company/company.module';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'environments/environment';

const config: SocketIoConfig = { url: environment.nodeServer, options: {} };

import { PositionModule } from './position/position.module';
import { PositionEffects } from './position/store/position.effects';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ErrorsComponent,
    Page404Component,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    StoreModule.forRoot(fromApp.appReducer),
    SocketIoModule.forRoot(config),
    EffectsModule.forRoot([EmployeeEffects, AuthEffects, CompanyEffects, PositionEffects]),
    EmployeesModule,
    CompanyModule,
    SharedModule,
    CoreModule,
    ChatModule,
    AuthModule,
    UserModule,
    PositionModule,
    AppRoutingModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
