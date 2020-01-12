

import { Action } from '@ngrx/store';
import { Employee } from '../employee.model';

// export const ATTEMPT = "[Employee] ATTEMPT";
// export const FINISHED = "[Employee] FINISHED";
// export const SET_ONE_EMPLOYEE = "[Employee] Set one Employee";
// export const UPDATE_EMPLOYEE = "[Employee] Update Employee";
// export const FETCH_ONE_EMPLOYEE = "[Employee] Fetch One Employee";
// export const STORE_EMPLOYEE_IN_DB = "[Employee] Store Employee in DB";
// export const DELETE_EMPLOYEE = "[Employee] DELETE Employee";
// export const DELETE_EMPLOYEE_FROM_DB = "[Employee] DELETE Employee from DB";
export const UPDATE_ACTIVE_EMPLOYEE_IN_DB = "[Employee] Update Active Employee in DB";
export const FETCH_ALL_EMPLOYEES = "[Employee] Fetch All Employees";
export const SET_ALL_EMPLOYEES = "[Employee] Set All Employees";
export const EMPLOYEE_OP_FAILURE = "[Employee] Employee operation failed";
export const CLEAR_ERROR = "[Employee] Clear error";

export type EmployeeActions = //SetOneEmployee 
                            // | UpdateEmployee
                            // | FetchOneEmployee
                            // | DeleteEmployee
                            | FetchAllEmployees
                            | SetAllEmployees
                            | EmployeeOpFailure
                            | ClearError;

export class FetchAllEmployees implements Action {
  readonly type = FETCH_ALL_EMPLOYEES;
}

export class UpdateEmployeeInDB implements Action {
  readonly type = UPDATE_ACTIVE_EMPLOYEE_IN_DB;
  
  constructor(public payload: Employee){}
}

export class SetAllEmployees implements Action {
  readonly type = SET_ALL_EMPLOYEES;

  constructor(public payload: Employee[]){}
}

export class EmployeeOpFailure implements Action {
  readonly type = EMPLOYEE_OP_FAILURE;

  constructor(public payload: any[]){}
}

export class ClearError implements Action {
  readonly type = CLEAR_ERROR;
}

// export class DeleteEmployee implements Action {
//   readonly type = DELETE_EMPLOYEE;
  
//   constructor(public payload: number){}
// }

// export class DeleteEmployeeFromDB implements Action {
//   readonly type = DELETE_EMPLOYEE_FROM_DB;
  
//   constructor(public payload: number){}
// }

// export class FetchOneEmployee implements Action {
//   readonly type = FETCH_ONE_EMPLOYEE;

//   constructor( public payload: string ){}
// }

// export class UpdateEmployee implements Action {
//   readonly type = UPDATE_EMPLOYEE;
  
//   constructor( public payload: Employee ){}
// }
// export class SetOneEmployee implements Action {
//   readonly type = SET_ONE_EMPLOYEE;

//   constructor(public payload: Employee){}
// }

// export class StoreEmployeeInDB implements Action {
//   readonly type = STORE_EMPLOYEE_IN_DB;

//   constructor(public payload: Employee){}
// }