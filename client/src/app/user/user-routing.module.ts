import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'app/auth/auth.guard';
import { DetailsUserComponent } from './details-user/details-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { PositionComponent } from 'app/position/position.component';
import { EditPositionComponent } from 'app/position/edit-position/edit-position.component';
import { DetailsPositionComponent } from 'app/position/details-position/details-position.component';
import { CompanyOnlyGuard } from 'app/company/company-only.guard';
import { EmployeeOnlyGuard } from 'app/employees/employee-only.guard';
import { EmployeesComponent } from 'app/employees/employees.component';
import { DetailsEmployeeComponent } from 'app/employees/details-employee/details-employee.component';
import { DetailsEmployeeGuard } from 'app/employees/details-employee/details-employee.guard';



const routes: Routes = [
  {
    path: 'my-details',
    component: DetailsUserComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'my-details/edit',
    component: EditUserComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'my-positions',
    component: PositionComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'my-positions/create',
    component: EditPositionComponent,
    canActivate: [AuthGuard, CompanyOnlyGuard]
  },
  {
    path: 'my-positions/saved/:index',
    component: DetailsPositionComponent,
    canActivate: [AuthGuard, EmployeeOnlyGuard]
  },
  {
    path: 'my-positions/applied/:index',
    component: DetailsPositionComponent,
    canActivate: [AuthGuard, EmployeeOnlyGuard]
  },
  {
    path: 'my-positions/all/:index',
    component: DetailsPositionComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'my-positions/all/:index/edit',
    component: EditPositionComponent,
    canActivate: [AuthGuard, CompanyOnlyGuard]
  },
  {
    path: 'my-applicants',
    component: EmployeesComponent,
    canActivate: [AuthGuard, CompanyOnlyGuard]
  },
  {
    path: 'my-applicants/:index',
    component: DetailsEmployeeComponent,
    canActivate: [AuthGuard, CompanyOnlyGuard, DetailsEmployeeGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
