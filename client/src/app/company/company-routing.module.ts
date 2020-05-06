
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { CompaniesComponent } from './companies.component';
import { CompanyResolverService } from './company-resolver.service';
import { AuthGuard } from 'app/auth/auth.guard';
import { DetailsCompanyComponent } from './details-company/details-company.component';
import { DetailsCompanyGuard } from './details-company/details-company.guard';
import { DetailsJobComponent } from 'app/job/details-job/details-job.component';




const routes: Routes = [
  {
    path: 'companies',
    component: CompaniesComponent,
    resolve: [CompanyResolverService],
  },
  {
    path: 'companies/:index',
    component: DetailsCompanyComponent,
    canActivate: [DetailsCompanyGuard],
    resolve: [CompanyResolverService],
  },
  {
    path: 'companies/:companyInx/job',
    component: DetailsJobComponent,
    canActivate: [DetailsCompanyGuard],
    resolve: [CompanyResolverService],
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyRoutingModule { }



