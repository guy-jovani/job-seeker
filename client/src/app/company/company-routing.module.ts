
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { CompaniesComponent } from './companies.component';
import { CompanyResolverService } from './company-resolver.service';
import { AuthGuard } from 'app/auth/auth.guard';
import { DetailsCompanyComponent } from './details-company/details-company.component';
import { DetailsCompanyGuard } from './details-company/details-company.guard';
import { DetailsPositionComponent } from 'app/position/details-position/details-position.component';




const routes: Routes = [
  {
    path: 'companies', component: CompaniesComponent, canActivate: [AuthGuard],
    resolve: [CompanyResolverService],
    children: [
      {
        path: ':index', component: DetailsCompanyComponent, canActivate: [DetailsCompanyGuard]
      },
      {
        path: ':companyInx/position', component: DetailsPositionComponent,
        canActivate: [DetailsCompanyGuard]
      },
    ]
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyRoutingModule { }



