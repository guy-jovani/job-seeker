import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from 'app/auth/auth.guard';

import { EmployeesComponent } from './employees.component';
import { EmployeesResolverService } from './employees-resolver.service';
import { DetailsEmployeeComponent } from './details-employee/details-employee.component';
import { DetailsEmployeeGuard } from './details-employee/details-employee.guard';




const routes: Routes = [
  {
    path: 'employees',
    canActivate: [AuthGuard],
    component: EmployeesComponent,
    resolve: [EmployeesResolverService],
  },
  {
    path: 'employees/:index',
    component: DetailsEmployeeComponent,
    canActivate: [AuthGuard, DetailsEmployeeGuard],
    resolve: [EmployeesResolverService],
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeesRoutingModule { }



















