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



const nodeServer = environment.nodeServer + 'auth/';

const handleError = (errorRes: any) => {
  let messages: any[] = [];
  if(!errorRes.error || !errorRes.error.errors){
    messages = ['an unknown error occured'];
  } else {
    for(let err of errorRes.error.errors){
      messages.push(err['msg'])
    }
  }
  return of(new AuthActions.AuthFailure(messages));
}

@Injectable()
export class AuthEffects {

  constructor(private actions$: Actions,
              private http: HttpClient,
              private store: Store<fromApp.AppState>,
              private router: Router){}

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
          map(res => {
            if(res['type'] === 'success'){
              localStorage.setItem("userData", JSON.stringify({...res['user']}));
              localStorage.setItem("kind", JSON.stringify(res['kind']));
              return new AuthActions.AuthSuccess({ user: res['user'], redirect: true, kind: res['kind'] });
            } else {
              const messages: any[] = [];
              for(let err of res['errors']){
                messages.push(err['msg'])
              }
              return new AuthActions.AuthFailure(messages);
            }
          }),
          catchError(err => {
            return handleError(err);
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
          map(res => {
            if(res['type'] === 'success'){
                localStorage.setItem("userData", JSON.stringify({...res['user']}));
                localStorage.setItem("kind", JSON.stringify(res['kind']));
                return new AuthActions.AuthSuccess({ user: res['user'], redirect: true, kind: res['kind'] });
            } else {
              const messages: any[] = [];
              for(let err of res['errors']){
                messages.push(err['msg'])
              }
              return new AuthActions.AuthFailure(messages);
            }
          }),
          catchError(err => {
            return handleError(err);
          })
        );
    })
  );

  @Effect({dispatch: false})
  activeUserChanges = this.actions$.pipe(
    ofType(AuthActions.UPDATE_ACTIVE_USER),
    map((actionData: AuthActions.UpdateActiveUser) => {
      localStorage.setItem("userData", JSON.stringify(actionData.payload.user));
      this.router.navigate(['../my-details']);
    })
  );

  @Effect()
  autoLogin = this.actions$.pipe(
    ofType(AuthActions.AUTO_LOGIN),
    map(() => {
      const user = JSON.parse(localStorage.getItem('userData'));
      const kind = JSON.parse(localStorage.getItem('kind'));
      if(!user || !kind){
        return { type: 'dummy' };
      }
      return new AuthActions.AuthSuccess({ user, redirect: false, kind });
    }),
    catchError(err => {
      return handleError(err);
    })
  );

  @Effect({dispatch: false})
  logout = this.actions$.pipe(
    ofType(AuthActions.LOGOUT),
    map(() => {
      localStorage.removeItem('userData');
      localStorage.removeItem('kind');
      this.router.navigate(['/login']);
    }),
    catchError(err => {
      console.log(err)
      return handleError(err);
    })
  );


  @Effect({ dispatch: false})
  redirectAuthSuccess = this.actions$.pipe(
    ofType(AuthActions.AUTH_SUCCESS),
    tap((actionData: AuthActions.AuthSuccess) => {
      if(actionData.payload.redirect){
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
            if(res['type'] === 'success'){
              return new AuthActions.ResetPassEmailSuccess();
            } else {
              const messages: any[] = [];
              for(let err of res['errors']){
                messages.push(err['msg'])
              }
              return new AuthActions.AuthFailure(messages);
            }
          }),
          catchError(err => {
            return handleError(err);
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
            if(res['type'] === 'success'){
              return new AuthActions.ResetPassSuccess();
            } else {
              const messages: any[] = [];
              for(let err of res['errors']){
                messages.push(err['msg'])
              }
              return new AuthActions.AuthFailure(messages);
            }
          }),
          catchError(err => {
            return handleError(err);
          })
        );
    })
  );
}

















