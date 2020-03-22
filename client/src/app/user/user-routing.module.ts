import { NgModule } from '@angular/core';
import { RouterModule, Routes, UrlSegment } from '@angular/router';
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
import { EmployeePositionStatus } from 'app/employees/employee.model';

const employeerPositionsIndexMatcher = (url: UrlSegment[]) => {
  return url.length === 3 && url[0].path === 'my-positions' &&
          [...Object.keys(EmployeePositionStatus).filter(key => isNaN(+key))].includes(url[1].path) ?
          { consumed: url } : null;
};

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
    matcher: employeerPositionsIndexMatcher,
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
