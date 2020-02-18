

import { Action } from '@ngrx/store';
import { Employee } from '../employee.model';

// export const ATTEMPT = '[Employee] ATTEMPT';
// export const FINISHED = '[Employee] FINISHED';
// export const SET_SINGLE_EMPLOYEE = '[Employee] Set single Employee';
// export const STORE_EMPLOYEE_IN_DB = '[Employee] Store Employee in DB';
// export const DELETE_EMPLOYEE = '[Employee] DELETE Employee';
// export const DELETE_EMPLOYEE_FROM_DB = '[Employee] DELETE Employee from DB';
export const UPDATE_SINGLE_EMPLOYEE = '[Employee] Update single Employee';
export const FETCH_SINGLE_EMPLOYEE = '[Employee] single One Employee';
export const UPDATE_SINGLE_EMPLOYEE_IN_DB = '[Employee] Update SINGLE Employee in DB';
export const FETCH_ALL_EMPLOYEES = '[Employee] Fetch All Employees';
export const SET_ALL_EMPLOYEES = '[Employee] Set All Employees';
export const EMPLOYEE_OP_FAILURE = '[Employee] Employee operation failed';
export const CLEAR_ERROR = '[Employee] Clear error';
export const LOGOUT = '[Employee] LOGOUT';

export type EmployeeActions = // SetSingleEmployee
                              UpdateSingleEmployee
                            | FetchSingleEmployee
                            // | DeleteEmployee
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

  constructor(public payload: { employee: Employee, password: string, confirmPassword: string}) {}
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

// export class DeleteEmployee implements Action {
//   readonly type = DELETE_EMPLOYEE;

//   constructor(public payload: number){}
// }

// export class DeleteEmployeeFromDB implements Action {
//   readonly type = DELETE_EMPLOYEE_FROM_DB;

//   constructor(public payload: number){}
// }

// export class SetOneEmployee implements Action {
//   readonly type = SET_ONE_EMPLOYEE;

//   constructor(public payload: Employee){}
// }

// export class StoreEmployeeInDB implements Action {
//   readonly type = STORE_EMPLOYEE_IN_DB;

//   constructor(public payload: Employee){}
// }
