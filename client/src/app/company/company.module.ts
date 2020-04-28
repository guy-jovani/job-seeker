
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'app/shared/shared.module';
import { CompanyRoutingModule } from './company-routing.module';
import { CompaniesComponent } from './companies.component';
import { EditCompanyComponent } from './edit-company/edit-company.component';
import { DetailsCompanyComponent } from './details-company/details-company.component';
import { ListCompaniesComponent } from './list-companies/list-companies.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { JobModule } from 'app/job/job.module';



@NgModule({
  declarations: [
    CompaniesComponent,
    ListCompaniesComponent,
    EditCompanyComponent,
    DetailsCompanyComponent,
  ],
  imports: [
    RouterModule,
    CompanyRoutingModule,
    SharedModule,
    JobModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    EditCompanyComponent,
    DetailsCompanyComponent,
  ]
})
export class CompanyModule {}
