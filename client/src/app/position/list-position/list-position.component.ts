import { Component, Input } from '@angular/core';

import { Employee } from 'app/employees/employee.model';
import { Company } from 'app/company/company.model';


@Component({
  selector: 'app-list-position',
  templateUrl: './list-position.component.html',
  styleUrls: ['./list-position.component.scss']
})
export class ListPositionComponent {

  @Input() showStatus = false; // true for user of kind employee
  @Input() companyPositions = false;
  @Input() detailsPositionUrl = '';
  @Input() positions: Employee['positions'] | Company['positions'] = null;

}
