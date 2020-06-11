import { Component, OnInit, OnDestroy } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromApp from '../../store/app.reducer';
import * as AuthActions from '../store/auth.actions';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['../auth.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {

  authForm: FormGroup;
  errorSub: Subscription;
  messages: string[] = [];
  isLoading = false;
  submitted = false;

  constructor(private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    this.errorSub = this.store.select('auth')
      .subscribe(
        authState => {
          if (authState.messages.length) {
            this.messages = [...authState.messages];
          } else {
            if (!this.isLoading && this.submitted) {
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
    this.messages = [];
    this.submitted = true;
    this.store.dispatch(new AuthActions.ResetPassEmailAttempt(email));
  }

  ngOnDestroy() {
    if (this.errorSub) {
      this.errorSub.unsubscribe();
    }
    this.onClose();
  }

  onClose() {
    this.store.dispatch(new AuthActions.ClearError());
    this.messages = [];
  }

}
