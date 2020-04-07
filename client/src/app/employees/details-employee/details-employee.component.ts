import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
import { NgForm } from '@angular/forms';

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
  selectedStatusList = 'all';
  closedMessages = false;
  addWork = false;
  submitted = false;
  workId: string = null;
  availableStatus = Object.keys(ApplicantStatus).filter(key => isNaN(+key));
  years = Array(new Date().getFullYear() - 1970 + 1).fill(0).map((val, i) => new Date().getFullYear() - i);
  monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  @ViewChild('workForm') workForm: NgForm;
  @ViewChild('backdrop') backdrop: ElementRef;

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
            this.addWork = this.submitted && (!!this.messages.length || this.closedMessages || this.isLoading);
          } else if (this.currUrl[0] === 'my-applicants') {
            if (!currState['user']) { return; }
            this.user = currState['user'];
            const applicant = this.user.applicants[+this.currUrl[1]];
            this.employee = applicant['employee'];
            this.checkJobOfUser();
          } else { // /employees/:empInd
            if (this.invalidStateListInd(currState, 'employees')) { return; }
            this.employee = currState['employees'][+this.currUrl[1]];
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
      this.router.navigate(['employees']);
      return true;
    }
    return false;
  }

  applicantJobsTracker(index, item) {
    return index;
  }

  checkJobOfUser() {
    if (this.selectedStatusList === 'all') {
      this.applicantJobs = this.user.applicants[+this.currUrl[1]].jobs;
    } else {
      this.applicantJobs = this.user.applicants[+this.currUrl[1]].jobs
            .filter(job => job.status.toString() === this.selectedStatusList);
    }
  }

  onClose() {
    this.closedMessages = true;
    if ((this.currUrl[0] === 'my-details' || this.currUrl[0] === 'my-applicants')) {
      this.store.dispatch(new UserActions.ClearError());
    } else {
      this.store.dispatch(new EmployeeActions.ClearError());
    }
  }

  onSubmit(form: NgForm) {
    this.messages = [];
    this.submitted = true;
    this.closedMessages = false;
    const controls = form.form.controls;
    if (controls.title.status === 'INVALID') {
      this.messages.push('The "Title" field is required.');
    }
    if (controls.company.status === 'INVALID') {
      this.messages.push('The "Company" field is required.');
    }
    if (controls.startMonth.status === 'INVALID') {
      this.messages.push('The "Start Date" field is required.');
    }
    if (!controls.present.value && controls.endMonth.status === 'INVALID') {
      this.messages.push('The "End Date" field is required - unless it is your current work place.');
    }
    if (!controls.present.value &&
        controls.endMonth.status === 'VALID' && controls.startMonth.status === 'VALID' &&
        new Date('01 ' + form.value.startMonth + ' ' + form.value.startYear) >
        new Date('01 ' + form.value.endMonth + ' ' + form.value.endYear)) {
      this.messages.push('The "End Date" can\'t be before "Start Date".');
    }

    if (this.messages.length) {
      return;
    }

    const work = {
      title: form.value.title,
      company: form.value.company,
      present: form.value.present,
      startDate: form.value.startMonth + ' ' + form.value.startYear,
      endDate: form.value.present ? null : (form.value.endMonth || '') + ' ' + (form.value.endYear || ''),
      employmentType: form.value.type
    };

    if (this.workId) {
      this.store.dispatch(new UserActions.UpdateWorkEmployeeInDb({
        ...work, workId: this.workId
      }));
    } else {
      this.store.dispatch(new UserActions.CreateWorkEmployeeInDb(work));
    }
  }

  onDeleteWork() {
    this.messages = [];
    this.submitted = true;
    this.closedMessages = false;
    this.store.dispatch(new UserActions.DeleteWorkEmployeeInDb(this.workId));
  }

  onToggleWork(ind?: number) {
    if (ind || ind === 0) {
      this.workId = this.employee.work[ind]._id;
      this.workForm.form.patchValue({
        title: this.employee.work[ind].title,
        type: this.employee.work[ind].employmentType || '',
        company: this.employee.work[ind].company,
        startMonth: this.monthNames[this.employee.work[ind].startDate.getMonth()],
        startYear: this.employee.work[ind].startDate.getFullYear()
      });
      const endDate = this.employee.work[ind].endDate;
      if (endDate) {
        this.workForm.form.patchValue({
          present: false,
          endMonth: this.monthNames[endDate.getMonth()],
          endYear: endDate.getFullYear(),
        });
      } else {
        this.workForm.form.patchValue({
          present: true,
          endMonth: '',
          endYear: '',
        });
      }
    } else {
      this.workId = null;
      this.workForm.reset();
      this.workForm.form.patchValue({
        title: '',
        type: '',
        company: '',
        startMonth: '',
        startYear: '',
        endMonth: '',
        endYear: '',
      });
    }
    this.addWork = !this.addWork;
    if (!this.addWork) {
      this.submitted = false;
    }
    this.messages = [];
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    this.onClose();
  }
}
