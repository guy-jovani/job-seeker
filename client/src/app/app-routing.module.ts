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
import { EditCompanyComponent } from './company/edit-company/edit-company.component';
import { CompanyResolverService } from './company/company-resolver.service';
import { DetailsCompanyComponent } from './company/details-company/details-company.component';
import { DetailsCompanyGuard } from './company/details-company/details-company.guard';


const routes: Routes = [
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
    path: '', component: HomeComponent, 
  },
  {
    path: 'companies', component: CompaniesComponent, canActivate: [AuthGuard], 
    resolve: [CompanyResolverService],
    children: [
      {
        path: ':index/company', component: DetailsCompanyComponent, canActivate: [DetailsCompanyGuard]
      },
      {
        path: ':index/company/edit', component: EditCompanyComponent, canActivate: [DetailsCompanyGuard],
      }
    ]  
  },
  {
    path: 'signup', component: SignupComponent, 
  },
  {
    path: 'my-details', component: DetailsEmployeeComponent, canActivate: [AuthGuard],  
    resolve: [CompanyResolverService],
    children: [
      {
        path: 'edit', component: EditEmployeeComponent
      },
      {
        path: 'register', component: EditCompanyComponent
      },
      {
        path: ':index/company', component: DetailsCompanyComponent, canActivate: [DetailsCompanyGuard]
      },
      {
        path: ':index/company/edit', component: EditCompanyComponent, canActivate: [DetailsCompanyGuard],
      }
    ]   
  },
  {
    path: 'login', component: LoginComponent, 
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
