

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';

import * as fromApp from '../../store/app.reducer';
import * as AuthActions from '../store/auth.actions';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  showPasswords = false;
  authForm: FormGroup;
  errorSub: Subscription;
  errorMessages: string[] = [];

  constructor(private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    this.errorSub = this.store.select('auth')
      .subscribe(
        authState => {
          if(authState.messages){
            for(let msg of authState.messages){
              this.errorMessages.push(msg)
            }
          } else {
            this.errorMessages = [];
          }
        }
      );

    this.authForm = new FormGroup({
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'passwords': new FormGroup({
        'password': new FormControl(null, [Validators.required, Validators.minLength(3)]),
        'confirmPassword': new FormControl(null, [Validators.required])
      }, this.checkPasswordEquality)
    });
  }

  checkPasswordEquality(control: FormControl) : {[s: string] : boolean}{
    if(control.get('password').value !== control.get('confirmPassword').value){
      return { equality: true }
    }
    return null;
  }


  onSubmit(){
    const email = this.authForm.value.email;
    const password = this.authForm.value.passwords.password;
    const confirmPassword = this.authForm.value.passwords.confirmPassword;
    this.store.dispatch(new AuthActions.SignupAttempt({email, password, confirmPassword}));
  }

  onTogglePasswords(){
    this.showPasswords = !this.showPasswords;
  }

  ngOnDestroy(){
    if(this.errorSub){
      this.errorSub.unsubscribe();
    }
  }

  onClose(){
    this.store.dispatch(new AuthActions.ClearError());
  }
}
