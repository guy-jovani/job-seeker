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

import { AngularFireModule } from '@angular/fire';
import { AngularFireStorageModule } from '@angular/fire/storage';
import * as fromApp from './store/app.reducer';
import { CompanyEffects } from './company/store/company.effects';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core.module';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'environments/environment';

const config: SocketIoConfig = { url: environment.nodeServer, options: {} };

import { JobEffects } from './job/store/job.effects';
import { UserEffects } from './user/store/user.effects';

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
    EffectsModule.forRoot([EmployeeEffects, AuthEffects, CompanyEffects, JobEffects, UserEffects]),
    AngularFireModule.initializeApp({
      apiKey: environment.firebaseAPIKey,
      authDomain: environment.firebaseAuthDomain,
      storageBucket: environment.firebaseStorageBucket,
      projectId: environment.firebaseProjectId,
    }),
    AngularFireStorageModule,
    SharedModule,
    CoreModule,
    AppRoutingModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
