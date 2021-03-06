import { NgModule } from '@angular/core';
import { DetailsUserComponent } from './details-user/details-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { CompanyModule } from 'app/company/company.module';
import { EmployeesModule } from 'app/employees/employees.module';
import { SharedModule } from '../shared/shared.module';
import { UserRoutingModule } from './user-routing.module';
import { JobModule } from 'app/job/job.module';


@NgModule({
  declarations: [
    DetailsUserComponent,
    EditUserComponent,
  ],
  imports: [
    CompanyModule,
    EmployeesModule,
    SharedModule,
    UserRoutingModule,
    JobModule
  ],
  exports: [
    DetailsUserComponent,
    EditUserComponent,
  ]
})
export class UserModule {}















