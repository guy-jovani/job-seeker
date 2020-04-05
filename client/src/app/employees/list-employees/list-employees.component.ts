import { Component, Input } from '@angular/core';
import { Employee } from '../employee.model';
import { ApplicantJob } from 'app/company/company.model';

@Component({
  selector: 'app-list-employees',
  templateUrl: './list-employees.component.html',
  styleUrls: ['./list-employees.component.scss']
})
export class ListEmployeesComponent {

  @Input() employees: Employee[] | { jobs: ApplicantJob[], employee: Employee }[];
  @Input() applicantsList = false;
}




