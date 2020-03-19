import { Actions, ofType, Effect } from '@ngrx/effects';

import { switchMap, withLatestFrom, map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';

import * as fromApp from '../../store/app.reducer';
import * as EmployeeActions from './employee.actions';
import * as AuthActions from '../../auth/store/auth.actions';
import * as UserActions from '../../user/store/user.actions';
import { Employee } from '../employee.model';
import { environment } from '../../../environments/environment';

const nodeServer = environment.nodeServer + 'employees/';


@Injectable()
export class EmployeeEffects {

  constructor(private actions$: Actions,
              private http: HttpClient,
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
        employeeFormDate.append('password', actionData.payload.employee['password']);
        employeeFormDate.append('confirmPassword', actionData.payload.employee['confirmPassword']);
      }
      employeeFormDate.append('deleteImage', actionData.payload.deleteImage.toString() );
      return this.http.post(nodeServer  + 'update', employeeFormDate)
        .pipe(
          map(res => {
            if (res['type'] === 'success') {
              this.store.dispatch(new EmployeeActions.ClearError());
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
  fetchAllEmployees = this.actions$.pipe(
    ofType(EmployeeActions.FETCH_ALL_EMPLOYEES),
    withLatestFrom(this.store.select('user')),
    switchMap(([actionData, userState]) => {
      return this.http.get<Employee[]>(nodeServer + 'fetchAll', {
        params: { _id: userState.user._id }
      })
        .pipe(
          map(res => {
            if (res['type'] === 'success') {
              return new EmployeeActions.SetAllEmployees(res['employees']);
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
    withLatestFrom(this.store.select('employee')),
    switchMap(([actionData, employeesState]) => {
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
