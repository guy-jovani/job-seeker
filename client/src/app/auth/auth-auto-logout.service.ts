import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';

import * as AuthActions from './store/auth.actions';

import * as fromApp from '../store/app.reducer';
import { environment } from 'environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthAutoLogoutService {

  tokenTimer: any;

  constructor(private store: Store<fromApp.AppState>,
              private router: Router) { }

  autoLogout = (expirationMillieSeconds: number) => {
    clearTimeout(this.tokenTimer);
    this.tokenTimer = setTimeout(() => {
      this.store.dispatch(new AuthActions.Logout());
      this.store.dispatch(new AuthActions.AuthFailure(
        ['Your session ended.']
        ));
      this.router.navigate(['/login']);
    }, expirationMillieSeconds + environment.autoLogoutPassJWTExpirationMS);
  }

  clearMyTimeout() {
    clearTimeout(this.tokenTimer);
  }
}
