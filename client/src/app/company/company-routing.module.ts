
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { CompaniesComponent } from './companies.component';
import { CompanyResolverService } from './company-resolver.service';
import { AuthGuard } from 'app/auth/auth.guard';
import { DetailsCompanyComponent } from './details-company/details-company.component';
import { DetailsCompanyGuard } from './details-company/details-company.guard';




const routes: Routes = [
  {
    path: 'companies', component: CompaniesComponent, canActivate: [AuthGuard],
    resolve: [CompanyResolverService],
    children: [
      {
        path: ':index/company', component: DetailsCompanyComponent, canActivate: [DetailsCompanyGuard]
      },
    ]
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyRoutingModule { }



