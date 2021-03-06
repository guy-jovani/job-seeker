import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import * as AuthActions from './store/auth.actions';

import * as fromApp from '../store/app.reducer';
import { environment } from 'environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthAutoLogoutService {

  tokenTimer: any;

  constructor(private store: Store<fromApp.AppState>) { }

  autoLogout = (expirationMillieSeconds: number) => {
    clearTimeout(this.tokenTimer);
    this.tokenTimer = setTimeout(() => {
      console.log('1111111111111111111111111111')
      console.log('1111111111111111111111111111')
      console.log('1111111111111111111111111111')
      this.store.dispatch(new AuthActions.Logout(true));
    }, expirationMillieSeconds + environment.autoLogoutPassJWTExpirationMS);
  }

  clearMyTimeout() {
    clearTimeout(this.tokenTimer);
  }
}
