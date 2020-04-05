import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { Subscription } from 'rxjs';
import * as fromApp from '../../store/app.reducer';
import { Employee } from '../employee.model';
import * as EmployeeActions from '../store/employee.actions';
import { Company, ApplicantJob, ApplicantStatus } from 'app/company/company.model';
import * as UserActions from '../../user/store/user.actions';
import { ChatService } from 'app/chat/chat-socket.service';

@Component({
  selector: 'app-details-employee',
  templateUrl: './details-employee.component.html',
  styleUrls: ['./details-employee.component.scss']
})
export class DetailsEmployeeComponent implements OnInit, OnDestroy {
  employee: Employee;
  routeSub: Subscription;
  allowEdit: boolean;
  user: Company = null; // only used for company applicants. /my-applicants/:index
  applicantJobs: ApplicantJob[] = null; // only used for company's applicant jobs. /my-applicants/:index
  isLoading = false;
  messages: string[] = [];
  currUrl: string[] = null;
  selctedStatusList = 'all';
  availableStatus = Object.keys(ApplicantStatus).filter(key => isNaN(+key));

  constructor(
    private store: Store<fromApp.AppState>,
    private route: ActivatedRoute,
    private chatService: ChatService,
    private router: Router) { }

  ngOnInit() {
    this.routeSub = this.route.params
      .pipe(
        switchMap(() => {
          this.currUrl = this.router.url.substring(1).split('/');
          if (this.currUrl[0] === 'my-details' || this.currUrl[0] === 'my-applicants') {
            return this.store.select('user');
          } else {
            return this.store.select('employee');
          }
        }))
        .subscribe(currState => {
          this.currUrl = this.router.url.substring(1).split('/');
          if (currState.messages) {
            this.messages = [];
            for (const msg of currState.messages) {
              this.messages.push(msg);
            }
          } else {
            this.messages = [];
          }
          this.isLoading = currState['loadingSingle'] || currState['loading'];
          if (this.currUrl[0] === 'my-details') {
            if (!currState['user']) { return; }
            this.employee = currState['user'] as Employee;
            this.allowEdit = true;
          } else if (this.currUrl[0] === 'my-applicants') {
            if (!currState['user']) { return; }
            this.user = currState['user'];
            const applicant = this.user.applicants[+this.currUrl[1]];
            this.employee = applicant['employee'];
            this.checkJobOfUser();
          } else {
            if (this.invalidStateListInd(currState, 'employee')) { return; }
            this.employee = currState['employee'][+this.currUrl[1]];
            this.allowEdit = false;
          }
        });
  }

  onAcceptReject(jobInfo: { status: ApplicantStatus, jobInd: number }) { // company actions
    this.store.dispatch(new UserActions.CompanyAcceptRejectJobAttempt());
    this.chatService.sendMessage('updateStatus', {
      status: jobInfo.status,
      kind: 'company',
      jobId: this.applicantJobs[jobInfo.jobInd].job._id,
      companyId: this.user._id,
      employeeId: this.employee._id,
      ownerId: this.user._id,
    });
  }

  private invalidStateListInd(currState, list) {
    if (this.currUrl[1] >= currState[list].length || +this.currUrl[1] < 0) {
      this.router.navigate(['employee']);
      return true;
    }
    return false;
  }

  applicantJobsTracker(index, item) {
    return index;
  }

  checkJobOfUser() {
    if (this.selctedStatusList === 'all') {
      this.applicantJobs = this.user.applicants[+this.currUrl[1]].jobs;
    } else {
      this.applicantJobs = this.user.applicants[+this.currUrl[1]].jobs
            .filter(job => job.status.toString() === this.selctedStatusList);
    }
  }

  onClose() {
    if ((this.currUrl[0] === 'my-details' || this.currUrl[0] === 'my-applicants')) {
      this.store.dispatch(new UserActions.ClearError());
    } else {
      this.store.dispatch(new EmployeeActions.ClearError());
    }
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    this.onClose();
  }
}
