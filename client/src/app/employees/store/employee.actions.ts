

import { Action } from '@ngrx/store';
import { Employee } from '../employee.model';


export const UPDATE_SINGLE_EMPLOYEE = '[Employee] Update single Employee';
export const FETCH_SINGLE_EMPLOYEE = '[Employee] single One Employee';
export const FETCH_EMPLOYEES = '[Employee] Fetch Employees';
export const SET_EMPLOYEES = '[Employee] Set Employees';
export const EMPLOYEE_OP_FAILURE = '[Employee] Employee operation failed';
export const CLEAR_ERROR = '[Employee] Clear error';
export const LOGOUT = '[Employee] LOGOUT';

export type EmployeeActions = UpdateSingleEmployee
                            | FetchSingleEmployee
                            | FetchEmployees
                            | Logout
                            | SetEmployees
                            | EmployeeOpFailure
                            | ClearError;

export class FetchEmployees implements Action {
  readonly type = FETCH_EMPLOYEES;

  constructor(public payload: { page: number } ) {}
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

export class UpdateSingleEmployee implements Action {
  readonly type = UPDATE_SINGLE_EMPLOYEE;

  constructor( public payload: Employee ) {}
}

export class Logout implements Action {
  readonly type = LOGOUT;
}

