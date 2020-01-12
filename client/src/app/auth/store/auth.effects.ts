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
import { Employee } from 'app/employees/employee.model';



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
          password: actionData['payload']['password'], 
          confirmPassword: actionData['payload']['confirmPassword'] 
        })
        .pipe(
          map(res => {
            if(res['type'] === 'success'){
              const employee = new Employee({
                ...res['employee'], token: res['token']
              });
              localStorage.setItem("employeeData", JSON.stringify(employee));
              return new AuthActions.AuthSuccess({
                employee, redirect: true
              });
            } else {
              const messages: any[] = [];
              for(let err of res['errors']){
                messages.push(err['msg'])
              }
              return new AuthActions.AuthFailure(messages);
            }
          }),
          catchError(err => {
            // console.log(err)
            return handleError(err);
          })
        );
    })
  );

  @Effect()
  login = this.actions$.pipe(
    ofType(AuthActions.LOGIN_ATTEMPT),
    switchMap(actionData => {
      return this.http.post(nodeServer  + 'login', 
        { 
          email: actionData['payload']['email'], 
          password: actionData['payload']['password']
        })
        .pipe(
          map(res => {
            if(res['type'] === 'success'){
              const employee = new Employee({
                ...res['employee'], token: res['token']
              });
              localStorage.setItem("employeeData", JSON.stringify(employee));
              return new AuthActions.AuthSuccess({
                employee, redirect: true
              });
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
  activeEmployeeChanges = this.actions$.pipe(
    ofType(AuthActions.AUTH_SUCCESS, AuthActions.ADD_ACTIVE_EMPLOYEE_COMPANY),
    map((actionData: AuthActions.AuthActions) => {
      const employee = JSON.parse(localStorage.getItem('employeeData'));
      if (actionData.type === AuthActions.ADD_ACTIVE_EMPLOYEE_COMPANY) {
        employee.companiesCreated.push(actionData.payload._id);
      }
      localStorage.setItem("employeeData", JSON.stringify(employee));
    })
  );

  @Effect()
  autoLogin = this.actions$.pipe(
    ofType(AuthActions.AUTO_LOGIN),
    map(() => {
      const employee = JSON.parse(localStorage.getItem('employeeData'));
      if(!employee){
        return { type: 'dummy' };
      }
      return new AuthActions.AuthSuccess({
        employee, redirect: false
      });
    }),
    catchError(err => {
      //console.log(err)
      return handleError(err);
    })
  );

  @Effect({dispatch: false})
  logout = this.actions$.pipe(
    ofType(AuthActions.LOGOUT),
    map(() => {
      localStorage.removeItem('employeeData');
      this.router.navigate(['/login']);
    }),
    catchError(err => {console.log(err)
      return handleError(err);
    })
  );


  @Effect({ dispatch: false})
  redirectSuccess = this.actions$.pipe(
    ofType(AuthActions.AUTH_SUCCESS),
    tap((actionData: AuthActions.AuthSuccess) => { 
      if(actionData.payload.redirect){
        this.router.navigate(['/']);
      }
    })
  );
}

















