import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { switchMap, map, catchError, tap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';

import { environment } from '../../../environments/environment';
import * as fromApp from '../../store/app.reducer';
import * as AuthActions from './auth.actions';
import * as UserActions from '../../user/store/user.actions';
import * as JobActions from '../../job/store/job.actions';
import * as EmployeeActions from '../../employees/store/employee.actions';
import * as CompanyActions from '../../company/store/company.actions';
import { Company } from 'app/company/company.model';
import { Employee } from 'app/employees/employee.model';
import { ChatService } from 'app/chat/chat-socket.service';
import { AuthAutoLogoutService } from '../auth-auto-logout.service';



const nodeServer = environment.nodeServer + 'auth/';

const setUserSessionStorage = (user: Company | Employee,
                               kind: string = null) => {
  sessionStorage.setItem('userData', JSON.stringify({...user}));
  if (kind) { sessionStorage.setItem('kind', JSON.stringify(kind)); }
};

const getUserAndTokensSessionStorage = () => {
  const user = JSON.parse(sessionStorage.getItem('userData'));
  const kind = JSON.parse(sessionStorage.getItem('kind'));
  const token = JSON.parse(sessionStorage.getItem('token'));
  const refreshToken = JSON.parse(sessionStorage.getItem('refreshToken'));
  const expirationDate = JSON.parse(sessionStorage.getItem('expirationDate'));
  return [user, kind, token, expirationDate, refreshToken];
};

const removeUserAndTokensSessionStorage = () => {
  sessionStorage.removeItem('userData');
  sessionStorage.removeItem('kind');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('expirationDate');
  sessionStorage.removeItem('refreshToken');
};

@Injectable()
export class AuthEffects {

  constructor(private actions$: Actions,
              private http: HttpClient,
              private chatService: ChatService,
              private authAutoLogoutService: AuthAutoLogoutService,
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
      const [user, kind, token, expirationDate, refreshToken] = getUserAndTokensSessionStorage();
      if (!user || !kind || !token || !expirationDate || !refreshToken) {
        return { type: 'dummy' };
      }
      const expirationMillieSeconds = new Date(expirationDate).getTime() - new Date().getTime();
      if (expirationMillieSeconds <= 0) { return { type: 'dummy' }; }

      this.chatService.sendMessage('login', {  _id: user['_id'], msg: 'logged' } );

      this.store.dispatch(new UserActions.UpdateActiveUser({ user, kind }));
      this.authAutoLogoutService.autoLogout(expirationMillieSeconds);
      return new AuthActions.AuthSuccess({ redirect: false, token, expiresInSeconds: expirationMillieSeconds / 1000, refreshToken });
    }),
    catchError(messages => {
      return of(new AuthActions.AuthFailure(messages));
    })
  );

  @Effect({dispatch: false})
  logout = this.actions$.pipe(
    ofType(AuthActions.LOGOUT),
    withLatestFrom(this.store.select('user')),
    switchMap(([actionData, userState]) => {
      return this.http.post(nodeServer + 'logout',
        {
          kind: userState.kind,
          _id: userState.user._id
        })
        .pipe(
          map(res => {
            if (res['type'] === 'success') {
              removeUserAndTokensSessionStorage();
              this.store.dispatch(new EmployeeActions.Logout());
              this.store.dispatch(new CompanyActions.Logout());
              this.store.dispatch(new JobActions.Logout());
              this.store.dispatch(new UserActions.Logout());
              this.authAutoLogoutService.clearMyTimeout();
              this.router.navigate(['/login']);
              return { type: 'dummy' };
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



  private signupLoginHandler = res => {
    if (res['type'] === 'success') {
      setUserSessionStorage(res['user'], res['kind']);

      this.chatService.sendMessage('login', {  _id: res['user']['_id'], msg: 'logged' } );
      this.store.dispatch(new UserActions.UpdateActiveUser({ user: res['user'], kind: res['kind'] }));
      this.authAutoLogoutService.autoLogout(res['expiresInSeconds'] * 1000);
      return new AuthActions.AuthSuccess({
        redirect: true,
        token: res['accessToken'],
        expiresInSeconds: res['expiresInSeconds'],
        refreshToken: res['refreshToken'] });
    } else {
      return new AuthActions.AuthFailure(res['messages']);
    }
  }

}

















