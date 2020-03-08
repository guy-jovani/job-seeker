import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { switchMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { environment } from '../../../environments/environment';
import * as fromApp from '../../store/app.reducer';
import * as AuthActions from './auth.actions';
import * as UserActions from '../../user/store/user.actions';
import * as PositionActions from '../../position/store/position.actions';
import * as EmployeeActions from '../../employees/store/employee.actions';
import * as CompanyActions from '../../company/store/company.actions';
import { Company } from 'app/company/company.model';
import { Employee } from 'app/employees/employee.model';
import { ChatService } from 'app/chat/chat-socket.service';



const nodeServer = environment.nodeServer + 'auth/';

const setUserLocalStorage = (user: Company | Employee,
                             kind: string = null,
                             token: string = null,
                             expirationDate: number = null) => {
  localStorage.setItem('userData', JSON.stringify({...user}));
  if (kind) { localStorage.setItem('kind', JSON.stringify(kind)); }
  if (token) { localStorage.setItem('token', JSON.stringify(token)); }
  if (expirationDate) {
    localStorage.setItem('expirationDate',
    JSON.stringify(new Date((new Date().getTime() + expirationDate)).toISOString()));
  }
};

const geUsertLocalStorage = () => {
  const user = JSON.parse(localStorage.getItem('userData'));
  const kind = JSON.parse(localStorage.getItem('kind'));
  const token = JSON.parse(localStorage.getItem('token'));
  const expirationDate = JSON.parse(localStorage.getItem('expirationDate'));
  return [user, kind, token, expirationDate];
};

const removeUserLocalStorage = () => {
  localStorage.removeItem('userData');
  localStorage.removeItem('kind');
  localStorage.removeItem('token');
  localStorage.removeItem('expirationDate');
};

@Injectable()
export class AuthEffects {

  private tokenTimer: any;

  constructor(private actions$: Actions,
              private http: HttpClient,
              private chatService: ChatService,
              private store: Store<fromApp.AppState>,
              private router: Router) {}

  @Effect()
  signup = this.actions$.pipe(
    ofType(AuthActions.SIGNUP_ATTEMPT),
    switchMap(actionData => {
      return this.http.put(nodeServer  + 'signup',
        {
          email: actionData['payload']['email'],
          name: actionData['payload']['name'],
          password: actionData['payload']['password'],
          confirmPassword: actionData['payload']['confirmPassword']
        })
        .pipe(
          map(this.signupLoginHandler),
          catchError(messages => {
            return of(new AuthActions.AuthFailure(messages));
          })
        );
    })
  );

  @Effect()
  login = this.actions$.pipe(
    ofType(AuthActions.LOGIN_ATTEMPT),
    switchMap(actionData => {
      return this.http.post(nodeServer + 'login',
        {
          email: actionData['payload']['email'],
          password: actionData['payload']['password']
        })
        .pipe(
          map(this.signupLoginHandler),
          catchError(messages => {
            return of(new AuthActions.AuthFailure(messages));
          })
        );
    })
  );

  @Effect()
  autoLogin = this.actions$.pipe(
    ofType(AuthActions.AUTO_LOGIN),
    map(() => {
      const [user, kind, token, expirationDate] = geUsertLocalStorage();
      if (!user || !kind || !token || !expirationDate) {
        return { type: 'dummy' };
      }
      const expirationSeconds = new Date(expirationDate).getTime() - new Date().getTime();
      if (expirationSeconds <= 0) { return { type: 'dummy' }; }
      this.autoLogout(expirationSeconds);
      this.chatService.sendMessage('login', {  _id: user['_id'], msg: 'logged' } );

      this.store.dispatch(new UserActions.UpdateActiveUser({user, kind}));
      return new AuthActions.AuthSuccess({ redirect: false, token });
    }),
    catchError(messages => {
      return of(new AuthActions.AuthFailure(messages));
    })
  );

  @Effect({dispatch: false})
  logout = this.actions$.pipe(
    ofType(AuthActions.LOGOUT),
    map(() => {
      removeUserLocalStorage();
      clearTimeout(this.tokenTimer);
      this.router.navigate(['/login']);
    }),
    catchError(messages => {
      return of(new AuthActions.AuthFailure(messages));
    })
  );


  @Effect({ dispatch: false})
  redirectAuthSuccess = this.actions$.pipe(
    ofType(AuthActions.AUTH_SUCCESS),
    tap((actionData: AuthActions.AuthSuccess) => {
      if (actionData.payload.redirect) {
        this.router.navigate(['/']);
      }
    })
  );

  @Effect({ dispatch: false})
  redirectResetPassSuccess = this.actions$.pipe(
    ofType(AuthActions.RESET_PASS_SUCCESS),
    tap((actionData: AuthActions.ResetPassSuccess) => {
      this.router.navigate(['/login']);
    })
  );

  @Effect()
  resetPasswordEmail = this.actions$.pipe(
    ofType(AuthActions.RESET_PASS_EMAIL_ATTEMPT),
    switchMap(actionData => {
      return this.http.post(nodeServer + 'resetPasswordEmail',
        {
          email: actionData['payload']
        })
        .pipe(
          map(res => {
            if (res['type'] === 'success') {
              return new AuthActions.ResetPassEmailSuccess();
            } else {
              return new AuthActions.AuthFailure(res['messages']);
            }
          }),
          catchError(messages => {
            return of(new AuthActions.AuthFailure(messages));
          })
        );
    })
  );

  @Effect()
  resetToNewPassword = this.actions$.pipe(
    ofType(AuthActions.RESET_PASS_ATTEMPT),
    switchMap(actionData => {
      return this.http.post(nodeServer  + 'resetToNewPassword',
        {
          password: actionData['payload']['password'],
          confirmPassword: actionData['payload']['confirmPassword'],
          token: actionData['payload']['token']
        })
        .pipe(
          map(res => {
            if (res['type'] === 'success') {
              return new AuthActions.ResetPassSuccess();
            } else {
              return new AuthActions.AuthFailure(res['messages']);
            }
          }),
          catchError(messages => {
            return of(new AuthActions.AuthFailure(messages));
          })
        );
    })
  );

  private autoLogout = (expirationSeconds: number) => {
    this.tokenTimer = setTimeout(() => {
      this.store.dispatch(new EmployeeActions.Logout());
      this.store.dispatch(new CompanyActions.Logout());
      this.store.dispatch(new AuthActions.Logout());
      this.store.dispatch(new PositionActions.Logout());
      this.store.dispatch(new PositionActions.Logout());
      this.store.dispatch(new UserActions.Logout());
    }, expirationSeconds);
  }

  private signupLoginHandler = res => {
    if (res['type'] === 'success') {
      setUserLocalStorage(res['user'], res['kind'], res['token'], res['expiresIn'] * 1000);
      this.autoLogout(res['expiresIn'] * 1000);
      this.store.dispatch(new UserActions.UpdateActiveUser({ user: res['user'], kind: res['kind'] }));
      return new AuthActions.AuthSuccess({ redirect: true, token: res['token'] });
    } else {
      return new AuthActions.AuthFailure(res['messages']);
    }
  }

}

















