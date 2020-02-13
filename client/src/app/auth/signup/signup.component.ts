

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';

import * as fromApp from '../../store/app.reducer';
import * as AuthActions from '../store/auth.actions';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-signup',
  templateUrl: '../auth.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  showPasswords = false;
  authForm: FormGroup;
  errorSub: Subscription;
  errorMessages: string[] = [];
  isLoading = false;
  companySignup = false;
  authAction = 'signup';

  constructor(private store: Store<fromApp.AppState>,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.errorSub = this.route.data.pipe(
      switchMap(val => {
        console.log(val);
        this.authAction = val.companySignup ? 'companySignup' : 'signup';
        return this.store.select('auth');
      })
    ).subscribe(
        authState => {
          this.isLoading = authState.loading;
          if (authState.messages) {
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
        password: new FormControl(null, [Validators.required, Validators.minLength(3)]),
        confirmPassword: new FormControl(null, [Validators.required])
      }, this.checkPasswordEquality)
    });

    if (this.authAction === 'companySignup') {
      this.authForm.addControl('name', new FormControl(null, [Validators.required]));
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
    const confirmPassword = this.authForm.value.passwords.confirmPassword;
    let name;
    if (this.authAction === 'companySignup') {
      name = this.authForm.value.name;
    }
    this.store.dispatch(new AuthActions.SignupAttempt({email, password, confirmPassword, name}));
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
