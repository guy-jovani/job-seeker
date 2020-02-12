
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'app/shared/shared.module';
import { CompanyRoutingModule } from './company-routing.module';
import { CompaniesComponent } from './companies.component';
import { EditCompanyComponent } from './edit-company/edit-company.component';
import { DetailsCompanyComponent } from './details-company/details-company.component';
import { ListCompaniesComponent } from './list-companies/list-companies.component';
import { ReactiveFormsModule } from '@angular/forms';



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
    ReactiveFormsModule,
  ],
  exports: [
    EditCompanyComponent,
    DetailsCompanyComponent,
  ]
})
export class CompanyModule {}
