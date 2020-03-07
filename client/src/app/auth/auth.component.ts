import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit, OnDestroy {
  showPasswords = false;
  authForm: FormGroup;
  errorSub: Subscription;
  errorMessages: string[] = [];
  isLoading = false;
  authAction: string;

  constructor(private store: Store<fromApp.AppState>,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.errorSub = this.route.data.pipe(
      switchMap(data => {
        this.authAction = data.authAction;
        return this.store.select('auth');
      })
    ).subscribe(
      authState => {
        this.isLoading = authState.loading;
        if (authState.messages) {
          this.errorMessages = [];
          for (const msg of authState.messages) {
            this.errorMessages.push(msg);
          }
        } else {
          this.errorMessages = [];
        }
      }
    );

    this.authForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      passwords: new FormGroup({
        password: new FormControl(null, [Validators.required, Validators.minLength(3)])
      })
    });

    if (this.authAction === 'companySignup') {
      this.authForm.addControl('name', new FormControl(null, [Validators.required]));
    }

    if (this.authAction !== 'login') {
      (this.authForm.controls['passwords'] as FormGroup).addControl('confirmPassword', new FormControl(null, [Validators.required]));
      (this.authForm.controls['passwords'] as FormGroup).setValidators(this.checkPasswordEquality);
      (this.authForm.controls['passwords'] as FormGroup).updateValueAndValidity();
    }
  }

  checkPasswordEquality(control: FormControl): {[s: string]: boolean} {
    if (control.get('password').value !== control.get('confirmPassword').value) {
      return { equality: true };
    }
    return null;
  }

  onSubmit() {
    const email = this.authForm.value.email;
    const password = this.authForm.value.passwords.password;
    if (this.authAction === 'login') {
      this.store.dispatch(new AuthActions.LoginAttempt({email, password}));
    } else {
      const confirmPassword = this.authForm.value.passwords.confirmPassword;
      let name: string;
      if (this.authAction === 'companySignup') {
        name = this.authForm.value.name;
      }
      this.store.dispatch(new AuthActions.SignupAttempt({email, password, confirmPassword, name}));
    }
  }

  onTogglePasswords() {
    this.showPasswords = !this.showPasswords;
  }

  ngOnDestroy() {
    if (this.errorSub) {
      this.errorSub.unsubscribe();
    }
  }

  onClose() {
    this.store.dispatch(new AuthActions.ClearError());
  }
}
