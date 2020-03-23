import { Component, Input } from '@angular/core';
import { Employee } from '../employee.model';
import { ApplicantPosition } from 'app/company/company.model';

@Component({
  selector: 'app-list-employee',
  templateUrl: './list-employee.component.html',
  styleUrls: ['./list-employee.component.scss']
})
export class ListEmployeeComponent {

  @Input() employees: Employee[] | { positions: ApplicantPosition[], employee: Employee }[];
  @Input() applicantsList = false;
}




