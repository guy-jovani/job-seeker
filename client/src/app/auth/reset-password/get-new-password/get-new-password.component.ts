import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromApp from '../../../store/app.reducer';
import * as AuthActions from '../../store/auth.actions';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-get-new-password',
  templateUrl: './get-new-password.component.html',
  styleUrls: ['./get-new-password.component.css']
})
export class GetNewPasswordComponent implements OnInit, OnDestroy {
  showPasswords = false;
  authForm: FormGroup;
  subscription: Subscription;
  messages: string[] = [];
  isLoading = false;
  token: string;

  constructor(private store: Store<fromApp.AppState>,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.subscription = this.route.params.pipe(
      switchMap(params => {
        this.token = params['token'];
        return this.store.select('auth');
      })
    )
    .subscribe(authState => {
      this.isLoading = authState.loading;
      if (authState.messages) {
        for (const msg of authState.messages) {
          this.messages.push(msg);
        }
      } else {
        this.messages = [];
      }
    });

    this.authForm = new FormGroup({
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

  onSubmit(){
    const password = this.authForm.value.passwords.password;
    const confirmPassword = this.authForm.value.passwords.confirmPassword;
    this.store.dispatch(new AuthActions.ResetPassAttempt({ password, confirmPassword, token: this.token }));
  }

  onTogglePasswords() {
    this.showPasswords = !this.showPasswords;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onClose() {
    this.store.dispatch(new AuthActions.ClearError());
  }

}
