import { Component, Input, Output, EventEmitter } from '@angular/core';

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
  @Input() applicantPositions = false;
  @Input() detailsPositionUrl = '';
  @Input() positions: Employee['positions'] | Company['positions'] = null;

  @Output() acceptRejectEmitter = new EventEmitter<{status: string, posInd: number}>();

  positionsTracker(index: number, item: Position) {
    return index;
  }

  getPositionDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
  }

  onAcceptReject(status: string, posInd: number) { // company actions
    this.acceptRejectEmitter.emit({ status, posInd });
  }

}
