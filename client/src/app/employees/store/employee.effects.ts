import { Actions, ofType, Effect } from '@ngrx/effects';

import { switchMap, withLatestFrom, map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';

import * as fromApp from '../../store/app.reducer';
import * as EmployeeActions from './employee.actions';
import * as UserActions from '../../user/store/user.actions';
import * as AuthActions from '../../auth/store/auth.actions';
import { Employee } from '../employee.model';
import { environment } from '../../../environments/environment';
import { AuthAutoLogoutService } from 'app/auth/auth-auto-logout.service';

const nodeServer = environment.nodeServer + 'employees/';


@Injectable()
export class EmployeeEffects {

  constructor(private actions$: Actions,
              private http: HttpClient,
              private authAutoLogoutService: AuthAutoLogoutService,
              private store: Store<fromApp.AppState>) {}


  @Effect()
  updateActiveEmployee = this.actions$.pipe(
    ofType(EmployeeActions.UPDATE_SINGLE_EMPLOYEE_IN_DB),
    switchMap((actionData: EmployeeActions.UpdateSingleEmployeeInDB) => {
      const employeeFormDate = new FormData();
      Object.keys(actionData.payload.employee).forEach(key => {
        employeeFormDate.append(key, actionData.payload.employee[key]);
      });
      if (actionData.payload['password']) {
        employeeFormDate.append('password', actionData.payload['password']);
        employeeFormDate.append('confirmPassword', actionData.payload['confirmPassword']);
      }
      employeeFormDate.append('deleteImage', actionData.payload.deleteImage.toString() );
      return this.http.post(nodeServer  + 'update', employeeFormDate)
        .pipe(
          map(res => {
            if (res['type'] === 'success') {
              this.store.dispatch(new EmployeeActions.ClearError());
              if (res['refreshToken']) {
                this.store.dispatch(new AuthActions.AuthSuccess({
                  redirect: false,
                  token: res['accessToken'],
                  refreshToken: res['refreshToken'],
                  expiresInSeconds: res['expiresInSeconds'],
                }));
                this.authAutoLogoutService.autoLogout(res['expiresInSeconds'] * 1000);
              }
              return new UserActions.UpdateActiveUser({ user: {...res['employee']}, redirect: 'my-details', kind: 'employee' });
            } else {
              return new EmployeeActions.EmployeeOpFailure(res['messages']);
            }
          }),
          catchError(messages => {
            return of(new EmployeeActions.EmployeeOpFailure(messages));
          })
        );
    })
  );

  @Effect()
  fetchEmployees = this.actions$.pipe(
    ofType(EmployeeActions.FETCH_EMPLOYEES),
    withLatestFrom(this.store.select('user')),
    switchMap(([actionData, userState]) => {
      return this.http.get<{employees: Employee[], total: number}>(nodeServer + 'fetchEmployees', {
        params: {
          _id: userState.user._id,
          page: actionData['payload']['page'],
          kind: userState.kind,
        }
      })
      .pipe(
        map(res => {
          if (res['type'] === 'success') {
            res.employees.forEach(emp => {
              emp.work.forEach(work => {
                work.startDate = new Date(work.startDate);
              });
            });
            return new EmployeeActions.SetEmployees({ employees: res.employees, total: res['total']});
          } else {
            return new EmployeeActions.EmployeeOpFailure(res['messages']);
          }
        }),
        catchError(messages => {
          return of(new EmployeeActions.EmployeeOpFailure(messages));
        })
      );
    })
  );

  @Effect()
  fetchSingleEmployee = this.actions$.pipe(
    ofType(EmployeeActions.FETCH_SINGLE_EMPLOYEE),
    switchMap(actionData => {
      return this.http.get<Employee>(nodeServer + 'fetchSingle', {
          params: { _id: actionData['payload'] }
        })
        .pipe(
          map(res => {
            if (res['type'] === 'success') {
              return new EmployeeActions.UpdateSingleEmployee({...res['employee']});
            } else {
              return new EmployeeActions.EmployeeOpFailure(res['messages']);
            }
          }),
          catchError(messages => {
            return of(new EmployeeActions.EmployeeOpFailure(messages));
          })
        );
    })
  );

}
