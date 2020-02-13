import { Component, OnInit, OnDestroy } from '@angular/core';
import * as fromApp from '../../store/app.reducer';
import * as AuthActions from '../store/auth.actions';
import { Store } from '@ngrx/store';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-company-signup',
  templateUrl: '../auth.component.html',
  styleUrls: ['./company-signup.component.css']
})
export class CompanySignupComponent implements OnInit, OnDestroy {
  showPasswords = false;
  authForm: FormGroup;
  errorSub: Subscription;
  errorMessages: string[] = [];
  companySignup = true;
  isLoading = false;
  authAction = 'companySignup';

  constructor(private store: Store<fromApp.AppState>) {}

  ngOnInit() {
    this.errorSub = this.store.select('auth')
      .subscribe(
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
      name: new FormControl(null, [Validators.required]),
      passwords: new FormGroup({
        password: new FormControl(null, [Validators.required, Validators.minLength(3)]),
        confirmPassword: new FormControl(null, [Validators.required])
      }, this.checkPasswordEquality)
    });
  }

  checkPasswordEquality(control: FormControl): {[s: string]: boolean} {
    if (control.get('password').value !== control.get('confirmPassword').value) {
      return { equality: true };
    }
    return null;
  }

  onSubmit() {
    const email = this.authForm.value.email;
    const name = this.authForm.value.name;
    const password = this.authForm.value.passwords.password;
    const confirmPassword = this.authForm.value.passwords.confirmPassword;
    this.store.dispatch(new AuthActions.SignupAttempt({
      email, password, confirmPassword, name
    }));
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
