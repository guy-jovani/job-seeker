import { NgModule } from '@angular/core';

import { Routes, RouterModule } from '@angular/router';
import { EmployeesComponent } from './employees/employees.component';
import { EditEmployeeComponent } from './employees/edit-employee/edit-employee.component';
import { ErrorsComponent } from './errors/errors.component';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { DetailsEmployeeComponent } from './employees/details-employee/details-employee.component';
import { DetailsEmployeeGuard } from './employees/details-employee/details-employee.guard';
import { EmployeesResolverService } from './employees/employees-resolver.service';
import { CompaniesComponent } from './company/companies.component';
import { CompanyResolverService } from './company/company-resolver.service';
import { DetailsCompanyComponent } from './company/details-company/details-company.component';
import { DetailsCompanyGuard } from './company/details-company/details-company.guard';
import { CompanySignupComponent } from './auth/company-signup/company-signup.component';
import { DetailsUserComponent } from './shared/details-user/details-user.component';
import { EditUserComponent } from './shared/edit-user/edit-user.component';


const routes: Routes = [
  {
    path: '', component: HomeComponent, 
  },
  {
    path: 'signup', component: SignupComponent
  },
  {
    path: 'signup/company', component: CompanySignupComponent
  },
  {
    path: 'login', component: LoginComponent, 
  },
  {
    path: 'employees', canActivate: [AuthGuard], 
    component: EmployeesComponent, 
    resolve: [EmployeesResolverService],
    children: [
      {
        path: ':index', component: DetailsEmployeeComponent, canActivate: [DetailsEmployeeGuard]
      },
    ]  
  },
  {
    path: 'companies', component: CompaniesComponent, canActivate: [AuthGuard], 
    resolve: [CompanyResolverService],
    children: [
      {
        path: ':index/company', component: DetailsCompanyComponent, canActivate: [DetailsCompanyGuard]
      },
    ]  
  },
  {
    path: 'my-details', component: DetailsUserComponent, canActivate: [AuthGuard],  
    children: [
      {
        path: 'edit', component: EditUserComponent
      },
    ]   
  },
  {
    path: '**', component: ErrorsComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
