import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Employee } from 'app/employees/employee.model';
import { Company, ApplicantStatus } from 'app/company/company.model';

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

  positionsTracker(index, item) {
    return index;
  }

  onAcceptReject(status: string, posInd: number) { // company actions
    this.acceptRejectEmitter.emit({ status, posInd });
  }

}
