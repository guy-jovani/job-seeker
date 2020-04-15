import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Employee } from 'app/employees/employee.model';
import { Company } from 'app/company/company.model';
import { Job } from '../job.model';

@Component({
  selector: 'app-list-jobs',
  templateUrl: './list-jobs.component.html',
  styleUrls: ['./list-jobs.component.scss']
})
export class ListJobsComponent {

  @Input() showStatus = false; // true for user of kind employee
  @Input() companyJobs = false;
  @Input() applicantJobs = false;
  @Input() detailsJobUrl = '';
  @Input() jobs: Employee['jobs'] | Company['jobs'] = null;

  @Output() acceptRejectEmitter = new EventEmitter<{status: string, jobInd: number}>();

  jobsTracker(index: number, item: Job) {
    return index;
  }

  getJobDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
  }

  onAcceptReject(status: string, jobInd: number) { // company action
    this.acceptRejectEmitter.emit({ status, jobInd });
  }

}
