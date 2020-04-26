import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Employee } from 'app/employees/employee.model';
import { Job } from '../job.model';

@Component({
  selector: 'app-list-jobs',
  templateUrl: './list-jobs.component.html',
  styleUrls: ['./list-jobs.component.scss']
})
export class ListJobsComponent {

  @Input() showStatus = false; // should be true only for user of kind employee
  @Input() generalCompany = false; // if jobs of a general company
  @Input() applicantJobs = false; // should be true only for user of kind company
  @Input() detailsJobUrl = ''; // on a user jobs page => the status list the user is looking at
  @Input() jobs: Employee['jobs'] | Job[] = null;

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
