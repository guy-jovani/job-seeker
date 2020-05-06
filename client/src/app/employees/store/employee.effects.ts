import { Actions, ofType, Effect } from '@ngrx/effects';

import { switchMap, withLatestFrom, map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';

import * as fromApp from '../../store/app.reducer';
import * as EmployeeActions from './employee.actions';
import { Employee, Work } from '../employee.model';
import { environment } from '../../../environments/environment';
import { UserStorageService } from 'app/user/user-storage.service';

const nodeServer = environment.nodeServer + 'employees/';


@Injectable()
export class EmployeeEffects {

  constructor(private actions$: Actions,
              private http: HttpClient,
              private userStorageService: UserStorageService,
              private store: Store<fromApp.AppState>) {}



  @Effect()
  fetchEmployees = this.actions$.pipe(
    ofType(EmployeeActions.FETCH_EMPLOYEES),
    withLatestFrom(this.store.select('user'), this.store.select('employee')),
    switchMap(([actionData, userState, employeeState]) => {
      const body = {
        page: employeeState['page'].toString()
      };
      if (employeeState['searchQuery']) {
        body['searchQuery'] = JSON.stringify(employeeState['searchQuery']);
        this.userStorageService.setUserSearchQueries(body['searchQuery'], 'employee');
      }
      return this.http.get<{employees: Employee[], total: number}>(nodeServer + 'fetchEmployees', {
        params: body
      })
      .pipe(
        map(res => {
          if (res['type'] === 'success') {
            res.employees.forEach(emp => {
              emp.work.forEach(work => {
                work.startDate = new Date(work.startDate);
                work.endDate = work.endDate ? new Date(work.endDate) : null;
              });
              emp.work.sort(this.sortWorkByEndDate);
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

  // @Effect()
  // fetchSingleEmployee = this.actions$.pipe(
  //   ofType(EmployeeActions.FETCH_SINGLE_EMPLOYEE),
  //   switchMap(actionData => {
  //     return this.http.get<Employee>(nodeServer + 'fetchSingle', {
  //         params: { _id: actionData['payload'] }
  //       })
  //       .pipe(
  //         map(res => {
  //           if (res['type'] === 'success') {
  //             return new EmployeeActions.SetSingleEmployee({...res['employee']});
  //           } else {
  //             return new EmployeeActions.EmployeeOpFailure(res['messages']);
  //           }
  //         }),
  //         catchError(messages => {
  //           return of(new EmployeeActions.EmployeeOpFailure(messages));
  //         })
  //       );
  //   })
  // );

  private sortWorkByEndDate = (a: Work, b: Work) => {
    if ((!a.endDate && !b.endDate) ||
        (a.endDate && b.endDate &&
          a.endDate.getTime() === b.endDate.getTime())) { // means a current work for both
      return a.startDate < b.startDate ? 1 : -1;
    }

    if (!a.endDate) {
      return -1;
    }

    if (!b.endDate || a.endDate < b.endDate) {
      return 1;
    }

    return -1;
  }

}
