import { Component, OnInit, OnDestroy } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromApp from '../../store/app.reducer';
import * as AuthActions from '../store/auth.actions';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit, OnDestroy {

  authForm: FormGroup;
  errorSub: Subscription;
  messages: string[] = [];
  isLoading = false;

  constructor(private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    this.errorSub = this.store.select('auth')
      .subscribe(
        authState => {
          if (authState.messages) {
            for (const msg of authState.messages) {
              this.messages.push(msg);
            }
          } else {
            this.messages = [];
            if (this.isLoading && !authState.loading) {
              this.messages.push('An email with a link to the reset page has been sent to you.');
            }
          }
          this.isLoading = authState.loading;
        }
      );

    this.authForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email])
    });
  }

  onSubmit() {
    const email = this.authForm.value.email;
    this.store.dispatch(new AuthActions.ResetPassEmailAttempt(email));
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
