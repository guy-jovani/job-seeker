import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { JobComponent } from './job.component';
import { JobResolverService } from './job-resolver.service';
import { DetailsJobComponent } from './details-job/details-job.component';
import { DetailsCompanyComponent } from 'app/company/details-company/details-company.component';
import { DetailsJobGuard } from './details-job/details-job.guard';
import { AuthGuard } from 'app/auth/auth.guard';
import { DetailsCompanyGuard } from 'app/company/details-company/details-company.guard';




const routes: Routes = [
  {
    path: 'jobs',
    component: JobComponent,
    canActivate: [AuthGuard],
    resolve: [JobResolverService]
  },
  {
    path: 'jobs/:index',
    component: DetailsJobComponent,
    canActivate: [AuthGuard, DetailsJobGuard],
    resolve: [JobResolverService]
  },
  {
    path: 'jobs/:index/company',
    component: DetailsCompanyComponent,
    canActivate: [AuthGuard, DetailsCompanyGuard],
    resolve: [JobResolverService]
  },
  {
    path: 'jobs/:index/company/job',
    component: DetailsJobComponent,
    canActivate: [AuthGuard, DetailsJobGuard],
    resolve: [JobResolverService]
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobRoutingModule { }




















