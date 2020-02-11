import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromApp from '../../store/app.reducer';
import * as AuthActions from '../store/auth.actions';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  showPassword = false;
  authForm: FormGroup;
  errorSub: Subscription;
  errorMessages: string[] = [];
  isLoading = false;

  constructor(private store: Store<fromApp.AppState>) { }

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
      password: new FormControl(null, [Validators.required, Validators.minLength(3)])
    });
  }

  onSubmit() {
    const email = this.authForm.value.email;
    const password = this.authForm.value.password;
    this.store.dispatch(new AuthActions.LoginAttempt({email, password}));
  }

  onTogglePassword() {
    this.showPassword = !this.showPassword;
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
