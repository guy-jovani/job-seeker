import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromApp from '../../store/app.reducer';
import * as AuthActions from '../store/auth.actions';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  authForm: FormGroup;
  errorSub: Subscription;
  errorMessages: string[] = [];
  isLoading = false;
  showConfirmation = false;

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
            this.showConfirmation = this.isLoading && !authState.loading; // the reser email was sent successfuly
            this.errorMessages = [];
          }
          this.isLoading = authState.loading;
        }
      );

    this.authForm = new FormGroup({
      'email': new FormControl(null, [Validators.required, Validators.email])
    })
  }

  onSubmit(){
    const email = this.authForm.value.email;
    this.store.dispatch(new AuthActions.ResetPassEmailAttempt(email));
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
