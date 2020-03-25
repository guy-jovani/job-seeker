import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { take, switchMap, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Injectable } from '@angular/core';

import { Employee } from './employee.model';
import * as fromApp from '../store/app.reducer';
import * as EmployeesActions from './store/employee.actions';
import { environment } from 'environments/environment';


@Injectable({
  providedIn: 'root'
})
export class EmployeesResolverService implements Resolve<Employee[]> {

  constructor(private store: Store<fromApp.AppState>,
              private actions$: Actions) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store.select('employee').pipe(
      take(1),
      switchMap(employeeState => {
        const timeFromLastFetchMS = !employeeState.lastFetch ? null :
                        new Date().getTime() - employeeState.lastFetch.getTime();
        if (!employeeState.employees.length || timeFromLastFetchMS > environment.fetchDataMSReset) {
          this.store.dispatch(new EmployeesActions.FetchAllEmployees());
          return this.actions$.pipe(
            ofType(EmployeesActions.SET_ALL_EMPLOYEES, EmployeesActions.EMPLOYEE_OP_FAILURE),
            take(1)
          );
        } else {
          return of(employeeState.employees);
        }
      })
    );
  }
}




















