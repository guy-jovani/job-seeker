import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';

import * as CompanyActions from '../../company/store/company.actions';
import * as JobActions from '../../job/store/job.actions';
import * as UserActions from '../../user/store/user.actions';
import * as fromApp from '../../store/app.reducer';
import { Job } from '../job.model';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { Employee } from 'app/employees/employee.model';
import { Company } from 'app/company/company.model';
import { ChatService } from 'app/chat/chat-socket.service';



@Component({
  selector: 'app-details-job',
  templateUrl: './details-job.component.html',
  styleUrls: ['./details-job.component.scss']
})
export class DetailsJobComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  job: Job = null;
  allowEdit = false;
  isLoading = false;
  currUrl: string[] = null;
  companyLink = true;
  messages: string[] = [];
  user: Employee | Company = null;
  allowApply: boolean;
  status: string = null;
  statusDate: string = null;
  kind: string = null;
  closedErrors = false;
  fetchedCompany = false;
  companyId: {_id: string, name: string} = null;

  @Input() companyJob: Job = null;

  constructor(
    private store: Store<fromApp.AppState>,
    private chatService: ChatService,
    private router: Router) { }

  ngOnInit() {
    this.subscription = this.store.select('user').pipe(
      switchMap(userState => {
        this.currUrl = this.router.url.substring(1).split('/');
        this.kind = userState.kind;
        this.user = userState.user;
        if (this.currUrl[0] === 'my-jobs') {
          return this.store.select('user');
        } else if (this.currUrl[0] === 'companies') {
          return this.store.select('company');
        } else {
          return this.store.select('job');
        }
      })
      ).subscribe(currState => {
        this.currUrl = this.router.url.substring(1).split('/');
        if (currState.messages) {
          this.messages = [];
          for (const msg of currState.messages) {
            this.messages.push(msg);
          }
          this.closedErrors = false;
        } else {
          this.messages = [];
        }
        this.isLoading = currState['loadingSingle'] || currState['loading'];
        if (this.currUrl[0] === 'my-jobs') {
          this.checkJobOfUser(currState);
        } else if (this.currUrl[0] === 'jobs') { // /jobs/:jobInd..
          this.checkJobFromJobsState(currState);
        } else { // /companies/:compInd/job
          this.checkJobOfACompany(currState);
        }
      });
  }

  private checkJobOfUser(authState) {
    if (this.kind === 'employee') {
      this.companyLink = false;
      this.job = null;
      if (authState['user']) {
        if (this.currUrl[1] === 'all') {
          if (this.invalidStateListInd(authState['user'].jobs, +this.currUrl[2])) { return; }
          this.job = authState['user'].jobs[+this.currUrl[2]].job;
        } else {
          const jobsList = authState['user']
          .jobs.filter(job => job.status === this.currUrl[1]);

          if (this.invalidStateListInd(jobsList, +this.currUrl[2])) { return; }
          this.job = jobsList[+this.currUrl[2]].job;
        }
        this.companyId = { _id: this.job.company._id, name: this.job.company.name };
        this.allowedApplySave();
      }
    } else {
      this.allowEdit = true;
      this.job = this.user ?
                      authState['user'].jobs[+this.currUrl[2]] : null;
      this.companyId = this.job ? { _id: this.job.company as string, name: this.user['name'] } : null;
    }
  }

  private checkJobOfACompany(companyState) {
    if (this.invalidStateListInd(companyState['companies'], +this.currUrl[1])) { return; }
    this.companyLink = false;
    this.job = !companyState['companies'] ? null :
    companyState['companies'][+this.currUrl[1]]['jobs'][window.history.state['jobInd']];
    if (!this.job) {
      this.messages = !this.closedErrors ? ['There was a problem fetching the job.'] : [];
    } else {
      this.companyId = { _id: this.job.company._id, name: this.job.company.name };
      this.allowedApplySave();
    }
  }

  private checkJobFromJobsState(jobState) {
    if (this.invalidStateListInd(jobState['jobs'], +this.currUrl[1])) { return; }
    if (this.currUrl[this.currUrl.length - 1] === 'job') { // /jobs/:jobInd/company/job
      this.companyLink = false;

      if (window.history.state['jobInd'] === undefined) {
        // on access from url - doesn't know which job to look for
        return this.router.navigate([this.currUrl[0], this.currUrl[1]]);
      }
      const jobsList = jobState['jobs'];
      const job = jobsList[+this.currUrl[1]];
      const companyOfJob = job['company'];
      const companyJobs = companyOfJob['jobs'];
      this.job = companyJobs[window.history.state['jobInd']];
      this.companyId = { ...job.company };
    } else { // /jobs/:jobInd
      this.job = jobState['jobs'] ? jobState['jobs'][+this.currUrl[1]] : null;
      this.companyId = { _id: this.job.company._id, name: this.job.company.name };
    }
    this.allowedApplySave();
  }

  private allowedApplySave() {
    this.allowApply = this.kind === 'employee';
    if (this.allowApply) {
      const userJobInfo = (this.user.jobs as Employee['jobs'])
                      .find(job => job.job._id === this.job._id);
      if (userJobInfo) {
        this.status = userJobInfo.status.toString();
        this.statusDate = this.getJobDate(userJobInfo.date);
      }
    }
  }

  getJobDate(dateStr: string | Date) {
    if (!dateStr) { return; }
    const date = new Date(dateStr);
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
  }

  onApplySave(status: string) { // employee actions
    if (this.currUrl[0] === 'companies') {
      this.store.dispatch(new CompanyActions.CompanyStateLoadSingle());
    } else if (this.currUrl[0] === 'jobs') {
      this.store.dispatch(new JobActions.JobStateLoadSingle());
    } else { // /my-jobs
      this.store.dispatch(new UserActions.EmployeeApplySaveJobAttempt());
    }
    this.chatService.sendMessage('updateStatus', {
      status,
      kind: 'employee',
      jobId: this.job._id,
      companyId: this.companyId._id,
      employeeId: this.user._id,
      ownerId: this.user._id,
    });
  }

  private invalidStateListInd(list, index) {
    if (index >= list.length || index < 0) {
      // check if trying to get details of an undefined job
      this.router.navigate([this.currUrl[0]]);
      return true;
    }
    return false;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.onClose();
  }

  onClose() {
    this.closedErrors = true;
    this.messages = [];
    if (this.fetchedCompany) { return; } // in that case the effect of the apply op will handle the errors
    if (this.currUrl[0] === 'companies') {
      this.store.dispatch(new CompanyActions.ClearError());
    } else if (this.currUrl[0] === 'jobs') {
      this.store.dispatch(new JobActions.ClearError());
    } else {
      this.store.dispatch(new UserActions.ClearError());
    }
  }

  getCompanyInfo() {
    if (this.currUrl.length === 2 && this.currUrl[0] === 'jobs' &&
          (!this.job.company.lastFetch || environment.fetchDataMSReset <
        new Date().getTime() - this.job.company.lastFetch.getTime())) {

      this.store.dispatch(new JobActions.UpdateSingleJobCompanyAttempt());
      this.store.dispatch(new CompanyActions.FetchSingleCompany({
        _id: this.job.company._id, main: false, jobInd: +this.currUrl[1]
      }));
      this.fetchedCompany = true;
    }
  }

}

