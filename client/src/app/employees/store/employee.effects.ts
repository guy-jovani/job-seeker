import { Actions, ofType, Effect } from '@ngrx/effects';

import { switchMap, withLatestFrom, map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';

import * as fromApp from '../../store/app.reducer';
import * as EmployeeActions from './employee.actions';
import { Employee } from '../employee.model';
import { environment } from '../../../environments/environment';

const nodeServer = environment.nodeServer + 'employees/';


@Injectable()
export class EmployeeEffects {

  constructor(private actions$: Actions,
              private http: HttpClient,
              private store: Store<fromApp.AppState>) {}



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
