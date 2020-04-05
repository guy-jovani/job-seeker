import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { SharedModule } from 'app/shared/shared.module';
import { EmployeesComponent } from './employees.component';
import { EditEmployeeComponent } from './edit-employee/edit-employee.component';
import { ListEmployeesComponent } from './list-employees/list-employees.component';
import { DetailsEmployeeComponent } from './details-employee/details-employee.component';
import { EmployeesRoutingModule } from './employees-routing.module';
import { JobModule } from 'app/job/job.module';



@NgModule({
  declarations: [
    EmployeesComponent,
    EditEmployeeComponent,
    ListEmployeesComponent,
    DetailsEmployeeComponent,
  ],
  imports: [
    RouterModule,
    EmployeesRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    JobModule
  ],
  exports: [
    EditEmployeeComponent,
    DetailsEmployeeComponent,
  ]
})
export class EmployeesModule {}









