

import { Action } from '@ngrx/store';
import { Employee } from '../employee.model';


export const UPDATE_SINGLE_EMPLOYEE = '[Employee] Update single Employee';
export const FETCH_SINGLE_EMPLOYEE = '[Employee] single One Employee';
export const UPDATE_SINGLE_EMPLOYEE_IN_DB = '[Employee] Update SINGLE Employee in DB';
export const FETCH_ALL_EMPLOYEES = '[Employee] Fetch All Employees';
export const SET_ALL_EMPLOYEES = '[Employee] Set All Employees';
export const EMPLOYEE_OP_FAILURE = '[Employee] Employee operation failed';
export const CLEAR_ERROR = '[Employee] Clear error';
export const LOGOUT = '[Employee] LOGOUT';

export type EmployeeActions = UpdateSingleEmployee
                            | FetchSingleEmployee
                            | FetchAllEmployees
                            | Logout
                            | UpdateSingleEmployeeInDB
                            | SetAllEmployees
                            | EmployeeOpFailure
                            | ClearError;

export class FetchAllEmployees implements Action {
  readonly type = FETCH_ALL_EMPLOYEES;
}

export class UpdateSingleEmployeeInDB implements Action {
  readonly type = UPDATE_SINGLE_EMPLOYEE_IN_DB;

  constructor(public payload: { employee: Employee, deleteImage: boolean,
    password: string, confirmPassword: string }) {}
}

export class SetAllEmployees implements Action {
  readonly type = SET_ALL_EMPLOYEES;

  constructor(public payload: Employee[]) {}
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

