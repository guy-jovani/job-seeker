import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { SharedModule } from 'app/shared/shared.module';
import { EmployeesComponent } from './employees.component';
import { EditEmployeeComponent } from './edit-employee/edit-employee.component';
import { ListEmployeeComponent } from './list-employee/list-employee.component';
import { DetailsEmployeeComponent } from './details-employee/details-employee.component';
import { EmployeesRoutingModule } from './employees-routing.module';



@NgModule({
  declarations: [
    EmployeesComponent,
    EditEmployeeComponent,
    ListEmployeeComponent,
    DetailsEmployeeComponent,
  ],
  imports: [
    RouterModule,
    EmployeesRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [
    EditEmployeeComponent,
    DetailsEmployeeComponent,
  ]
})
export class EmployeesModule {}









