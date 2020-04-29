import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
import { FormGroup, FormControl, Validators } from '@angular/forms';

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
  submitAcceptReject = false;
  availableStatus = Object.keys(ApplicantStatus).filter(key => isNaN(+key));
  closedMessages = false;
  toggleExperienceShow = false;

  years = Array(new Date().getFullYear() - 1970 + 1).fill(0).map((val, i) => new Date().getFullYear() - i);
  monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  addWork = false;
  submittedWork = false;
  workForm: FormGroup;
  workId: string = null;

  showNewPasswords = false;
  showCurrPassword = false;
  changePassword = false;
  submittedPassword = false;
  changePasswordForm: FormGroup;

  constructor(
    private store: Store<fromApp.AppState>,
    private route: ActivatedRoute,
    private chatService: ChatService,
    private router: Router) { }

  ngOnInit() {
    this.changePasswordForm = new FormGroup({
      currentPassword: new FormControl(null, [Validators.minLength(3), Validators.required]),
      passwords: new FormGroup({
        newPassword: new FormControl(null, [Validators.minLength(3), Validators.required]),
        confirmNewPassword: new FormControl(null, [Validators.required])
      }, this.checkPasswordEquality)
    });

    this.workForm = new FormGroup({
      title: new FormControl(null, [Validators.required]),
      type: new FormControl(null),
      company: new FormControl(null, [Validators.required]),
      present: new FormControl(true, []),
      startDate: new FormGroup({
        startMonth: new FormControl('', [Validators.required]),
        startYear: new FormControl('', [Validators.required]),
      }, [Validators.required, this.checkWorkStartDate]),
      endDate: new FormGroup({
        endMonth: new FormControl(''),
        endYear: new FormControl(''),
      })
    }, [this.checkWorkEndDate]);

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
            this.messages = [...currState.messages];
          } else {
            this.messages = [];
          }
          this.isLoading = currState['loadingSingle'] || currState['loading'];

          if (this.currUrl[0] === 'my-details') {
            if (!currState['user']) { return; }
            this.employee = currState['user'] as Employee;
            this.allowEdit = true;

            this.addWork = this.submittedWork && (!!this.messages.length || this.closedMessages || this.isLoading);
            this.submittedWork = this.addWork;

            this.changePassword = this.submittedPassword && (!!this.messages.length || this.closedMessages || this.isLoading);
            this.submittedPassword = this.changePassword;

            this.closedMessages = false;
          } else if (this.currUrl[0] === 'my-applicants') {
            if (!currState['user']) { return; }
            this.user = currState['user'];
            const applicant = this.user.applicants[+this.currUrl[1]];
            this.employee = applicant['employee'];
            this.submitAcceptReject = this.isLoading ? this.submitAcceptReject : false;
            this.checkJobOfApplicant();
          } else { // /employees/:empInd
            if (this.invalidStateListInd(currState, 'employees')) { return; }
            this.employee = currState['employees'][+this.currUrl[1]];
            this.allowEdit = false;
          }
        });
  }

  checkWorkStartDate(control: FormControl): {[s: string]: boolean} {
    if (new Date('01 ' + control.get('startMonth').value + ' '
    + control.get('startYear').value) > new Date()) {
      return { startDateInFuture: true };
    }
    return null;
  }
  checkWorkEndDate(control: FormControl): {[s: string]: boolean} {
    if (!control.get('present').value && !control.get('endDate.endMonth').value) {
      return { endMonthRequired: true };
    }
    if (!control.get('present').value && !control.get('endDate.endYear').value) {
      return { endYearRequired: true };
    }
    if (new Date('01 ' + control.get('endDate.endMonth').value + ' ' + control.get('endDate.endYear').value) <
        new Date('01 ' + control.get('startDate.startMonth').value +
        ' ' + control.get('startDate.startYear').value)) {
      return { endDateBeforeStart: true };
    }
    return null;
  }


  onAcceptReject(jobInfo: { status: ApplicantStatus, jobInd: number }) { // company actions
    this.submitAcceptReject = true;
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
      this.router.navigate(['people']);
      return true;
    }
    return false;
  }

  applicantJobsTracker(index, item) {
    return index;
  }

  checkJobOfApplicant() {
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

  onToggleExperienceShow() {
    this.toggleExperienceShow = !this.toggleExperienceShow;
  }

  onSubmitWork() {
    this.messages = [];
    this.submittedWork = true;
    if (this.workForm.invalid) {
      return this.store.dispatch(new UserActions.UserFailure(['The form is invalid.']));
    }
    const formValue = this.workForm.value;
    const work = {
      title: formValue.title,
      company: formValue.company,
      present: formValue.present,
      startDate: formValue.startDate.startMonth + ' ' + formValue.startDate.startYear,
      endDate: formValue.present ? null : (formValue.endDate.endMonth || '') + ' ' +
                (formValue.endDate.endYear || ''),
      employmentType: formValue.type
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
    this.submittedWork = true;
    this.store.dispatch(new UserActions.DeleteWorkEmployeeInDb(this.workId));
  }

  onToggleWork(ind?: number) {
    if (ind || ind === 0) {
      this.workId = this.employee.work[ind]._id;
      this.workForm.patchValue({
        title: this.employee.work[ind].title,
        type: this.employee.work[ind].employmentType || '',
        company: this.employee.work[ind].company,
        startDate: {
          startMonth: this.monthNames[this.employee.work[ind].startDate.getMonth()],
          startYear: this.employee.work[ind].startDate.getFullYear()
        }
      });
      const endDate = this.employee.work[ind].endDate;
      if (endDate) {
        this.workForm.patchValue({
          present: false,
          endDate: {
            endMonth: this.monthNames[endDate.getMonth()],
            endYear: endDate.getFullYear(),
          }
        });
      } else {
        this.workForm.patchValue({
          present: true,
          endDate: {
            endMonth: '',
            endYear: '',
          }
        });
      }
    } else {
      this.workId = null;
      this.workForm.reset();
      this.workForm.patchValue({
        present: true,
        title: '',
        type: '',
        company: '',
        startDate: {
          startMonth: '',
          startYear: ''
        },
        endDate: {
          endMonth: '',
          endYear: ''
        }
      });
    }
    this.addWork = !this.addWork;
    if (!this.addWork) {
      this.submittedWork = false;
    }
    this.messages = [];
  }

  getEmployeeName(emp: Employee) {
    const name = (emp.firstName ? emp.firstName : '') + ' ' +
            (emp.lastName ? emp.lastName : '');
    return name.trim() || emp.email;
  }

  checkPasswordEquality(control: FormControl): {[s: string]: boolean} {
    if (control.get('newPassword').value !== control.get('confirmNewPassword').value) {
      return { equality: true };
    }
    return null;
  }

  onToggleNewPasswords() {
    this.showNewPasswords = !this.showNewPasswords;
  }

  onToggleCurrPassword() {
    this.showCurrPassword = !this.showCurrPassword;
  }

  onSubmitChangePassword() {
    if (this.changePasswordForm.invalid) {
      return this.store.dispatch(new UserActions.UserFailure(['The form is invalid']));
    }
    const formValue = this.changePasswordForm.value;
    const currPassword = formValue.currentPassword;
    const newPassword = formValue.passwords.newPassword;
    const confirmNewPassword = formValue.passwords.confirmNewPassword;
    this.submittedPassword = true;
    this.store.dispatch(new UserActions.ChangeUserPassword({
      currPassword, newPassword, confirmNewPassword, kind: 'employee' }));
  }

  onTogglePasswordChange() {
    this.changePassword = !this.changePassword;
    this.showNewPasswords = false;
    this.showCurrPassword = false;
    this.submittedPassword = this.changePassword;
    this.changePasswordForm.reset();
    if (this.messages.length) {
      this.store.dispatch(new UserActions.ClearError());
    }
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    this.onClose();
  }
}
