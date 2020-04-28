

import { Action } from '@ngrx/store';
import { Employee } from '../employee.model';

export const SET_SEARCH_QUERY_EMPLOYEE = '[Employee] SET_SEARCH_QUERY_EMPLOYEE';

export const SET_SINGLE_EMPLOYEE = '[Employee] Set single Employee';
export const FETCH_SINGLE_EMPLOYEE = '[Employee] single One Employee';

export const FETCH_EMPLOYEES = '[Employee] Fetch Employees';
export const SET_EMPLOYEES = '[Employee] Set Employees';

export const EMPLOYEE_OP_FAILURE = '[Employee] Employee operation failed';
export const CLEAR_ERROR = '[Employee] Clear error';
export const LOGOUT = '[Employee] LOGOUT';

export type EmployeeActions = SetSingleEmployee
                            | FetchSingleEmployee
                            | FetchEmployees
                            | Logout
                            | SetEmployees
                            | EmployeeOpFailure
                            | SetSearchQueryEmployee
                            | ClearError;

export class FetchEmployees implements Action {
  readonly type = FETCH_EMPLOYEES;

  constructor(public payload?: { search: { name?: string, company?: string, work?: string } } ) {}
}

export class SetSearchQueryEmployee implements Action {
  readonly type = SET_SEARCH_QUERY_EMPLOYEE;

  constructor(public search: { name?: string, company?: string, work?: string } ) {}
}

export class SetEmployees implements Action {
  readonly type = SET_EMPLOYEES;

  constructor(public payload: {employees: Employee[], total: number}) {}
}

export class EmployeeOpFailure implements Action {
  readonly type = EMPLOYEE_OP_FAILURE;

  constructor(public payload: string[]) {}
}

export class ClearError implements Action {
  readonly type = CLEAR_ERROR;
}

export class FetchSingleEmployee implements Action {
  readonly type = FETCH_SINGLE_EMPLOYEE;

  constructor( public payload: string ) {}
}

export class SetSingleEmployee implements Action {
  readonly type = SET_SINGLE_EMPLOYEE;

  constructor( public payload: Employee ) {}
}

export class Logout implements Action {
  readonly type = LOGOUT;
}

