import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import * as CompanyActions from '../store/company.actions';
import * as JobActions from '../../job/store/job.actions';
import * as UserActions from '../../user/store/user.actions';
import { Company } from '../company.model';
import * as fromApp from '../../store/app.reducer';
import { Store } from '@ngrx/store';
import { switchMap } from 'rxjs/operators';
import { Job } from 'app/job/job.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-details-company',
  templateUrl: './details-company.component.html',
  styleUrls: ['./details-company.component.scss']
})
export class DetailsCompanyComponent implements OnInit, OnDestroy  {
  routeSub: Subscription;
  company: Company = null;
  allowEdit: boolean;
  isLoading = false;
  currUrl: string[] = null;
  messages: string[] = [];
  companyJobs: Job[] = null;

  showNewPasswords = false;
  showCurrPassword = false;
  submittedPassword = false;
  closedMessages = false;
  changePassword = false;
  changePasswordForm: FormGroup;

  constructor(private store: Store<fromApp.AppState>,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.changePasswordForm = new FormGroup({
      currentPassword: new FormControl(null, [Validators.minLength(3), Validators.required]),
      passwords: new FormGroup({
        newPassword: new FormControl(null, [Validators.minLength(3), Validators.required]),
        confirmNewPassword: new FormControl(null, [Validators.required])
      }, this.checkPasswordEquality)
    });

    this.routeSub = this.route.params.pipe(
      switchMap(() => {
        this.currUrl = this.route.snapshot['_routerState'].url.substring(1).split('/');
        if (this.currUrl[0] === 'my-details') {
          return this.store.select('user');
        } else if (this.currUrl[0] === 'companies') {
          return this.store.select('company');
        } else {
          return this.store.select('job');
        }
      }))
      .subscribe(currState => {
        this.currUrl = this.router.url.substring(1).split('/');
        this.isLoading = currState['loadingSingle'] || currState['loading'];
        if (currState.messages) {
          this.messages = [...currState.messages];
        } else {
          this.messages = [];
        }

        if (this.currUrl[0] === 'my-details') {
          this.company = currState['user'] as Company;
          this.allowEdit = true;
          this.changePassword = this.submittedPassword && (!!this.messages.length || this.closedMessages || this.isLoading);
          this.closedMessages = false;
        } else if (this.currUrl[0] === 'companies') {
          if (this.invalidStateListInd(currState, 'companies')) { return; }
          this.company = currState['companies'][+this.currUrl[1]];
          this.allowEdit = false;
        } else { // /jobs/:jobInd/company
          if (this.invalidStateListInd(currState, 'jobs')) { return; }
          this.allowEdit = false;
          this.company = !currState['jobs'] ? null : currState['jobs'][+this.currUrl[1]]['company'];
          if (!this.company.email) {
            this.messages = ['There was an error fetching the company'];
          }
          this.companyJobs = this.company.jobs;
        }
      });
  }

  private invalidStateListInd(currState, list) {
    if (this.currUrl[1] >= currState[list].length || +this.currUrl[1] < 0) {
      this.router.navigate(['companies']);
      return true;
    }
    return false;
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
      currPassword, newPassword, confirmNewPassword, kind: 'company' }));
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

  onClose() {
    this.closedMessages = true;
    if (this.currUrl[0] === 'companies') {
      this.store.dispatch(new CompanyActions.ClearError());
    } else if (this.currUrl[0] === 'my-details') {
      this.store.dispatch(new UserActions.ClearError());
    } else {
      this.store.dispatch(new JobActions.ClearError());
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
