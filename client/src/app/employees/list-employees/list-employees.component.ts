import { Component, Input } from '@angular/core';
import { Employee } from '../employee.model';
import { Applicant } from 'app/company/company.model';

@Component({
  selector: 'app-list-employees',
  templateUrl: './list-employees.component.html',
  styleUrls: ['./list-employees.component.scss']
})
export class ListEmployeesComponent {

  @Input() employees: Employee[] | Applicant[];
  @Input() applicantsList = false;
  @Input() userId: string = null;


  getEmployeeName(emp: Employee | Applicant) {
    let name: string;
    if (!this.applicantsList && this.userId === (emp as Employee)._id) {
      return '(you)';
    }
    if (emp['email']) {
      emp = emp as Employee;
      name = (emp.firstName ? emp.firstName : '') + ' ' +
              (emp.lastName ? emp.lastName : '');
      return name.trim() || emp.email;
    }
    emp = emp as Applicant;
    name = (emp.employee.firstName ? emp.employee.firstName : '') + ' ' +
            (emp.employee.lastName ? emp.employee.lastName : '');
    return name.trim() || emp.employee.email;
  }
}




