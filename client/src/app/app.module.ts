import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EmployeesComponent } from './employees/employees.component';
import { HeaderComponent } from './header/header.component';
import { EditEmployeeComponent } from './employees/edit-employee/edit-employee.component';
import { ErrorsComponent } from './errors/errors.component';
import { Page404Component } from './errors/page404/page404.component';
import { HomeComponent } from './home/home.component';
import { DropdownDirective } from './shared/dropdown.directive';
import { EmployeeEffects } from './employees/store/employee.effects';
import { AutoFocusDirective } from './shared/auto-focus.directive';
import { AlertComponent } from './shared/alert/alert.component';
import { SignupComponent } from './auth/signup/signup.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthEffects } from './auth/store/auth.effects';

import * as fromApp from './store/app.reducer';
import { ListEmployeeComponent } from './employees/list-employee/list-employee.component';
import { DetailsEmployeeComponent } from './employees/details-employee/details-employee.component';
import { CompaniesComponent } from './company/companies.component';
import { ListCompaniesComponent } from './company/list-companies/list-companies.component';
import { EditCompanyComponent } from './company/edit-company/edit-company.component';
import { CompanyEffects } from './company/store/company.effects';
import { DetailsCompanyComponent } from './company/details-company/details-company.component';
import { CompanySignupComponent } from './auth/company-signup/company-signup.component';
import { DetailsUserComponent } from './shared/details-user/details-user.component';
import { EditUserComponent } from './shared/edit-user/edit-user.component';

@NgModule({
  declarations: [
    AppComponent,
    EmployeesComponent,
    HeaderComponent,
    EditEmployeeComponent,
    ListEmployeeComponent,
    ErrorsComponent,
    Page404Component,
    HomeComponent,
    CompanySignupComponent,
    DropdownDirective,
    AutoFocusDirective,
    DetailsEmployeeComponent,
    AlertComponent,
    SignupComponent,
    LoginComponent,
    CompaniesComponent,
    ListCompaniesComponent,
    EditCompanyComponent,
    DetailsCompanyComponent,
    DetailsUserComponent,
    EditUserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    StoreModule.forRoot(fromApp.appReducer),
    EffectsModule.forRoot([EmployeeEffects, AuthEffects, CompanyEffects]),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
