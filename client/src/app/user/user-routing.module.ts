import { NgModule } from '@angular/core';
import { RouterModule, Routes, UrlSegment } from '@angular/router';
import { AuthGuard } from 'app/auth/auth.guard';
import { DetailsUserComponent } from './details-user/details-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { JobComponent } from 'app/job/job.component';
import { EditJobComponent } from 'app/job/edit-job/edit-job.component';
import { DetailsJobComponent } from 'app/job/details-job/details-job.component';
import { CompanyOnlyGuard } from 'app/company/company-only.guard';
import { EmployeeOnlyGuard } from 'app/employees/employee-only.guard';
import { EmployeesComponent } from 'app/employees/employees.component';
import { DetailsEmployeeComponent } from 'app/employees/details-employee/details-employee.component';
import { DetailsEmployeeGuard } from 'app/employees/details-employee/details-employee.guard';
import { EmployeeJobStatus } from 'app/employees/employee.model';

const employeerJobsIndexMatcher = (url: UrlSegment[]) => {
  return url.length === 3 && url[0].path === 'my-jobs' &&
          [...Object.keys(EmployeeJobStatus).filter(key => isNaN(+key))].includes(url[1].path) ?
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
    path: 'my-jobs',
    component: JobComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'my-jobs/create',
    component: EditJobComponent,
    canActivate: [AuthGuard, CompanyOnlyGuard]
  },
  {
    matcher: employeerJobsIndexMatcher,
    component: DetailsJobComponent,
    canActivate: [AuthGuard, EmployeeOnlyGuard]
  },
  {
    path: 'my-jobs/all/:index',
    component: DetailsJobComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'my-jobs/all/:index/edit',
    component: EditJobComponent,
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
