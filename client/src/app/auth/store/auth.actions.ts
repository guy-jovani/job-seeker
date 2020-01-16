

import { Action } from '@ngrx/store';
import { Employee } from 'app/employees/employee.model';
import { Company } from 'app/company/company.model';

export const SIGNUP_ATTEMPT = "[Auth] SIGNUP_ATTEMPT";
export const LOGIN_ATTEMPT = "[Auth] LOGIN_ATTEMPT";
export const LOGOUT = "[Auth] LOGOUT";
export const AUTH_SUCCESS = "[Auth] AUTH_SUCCESS";
export const UPDATE_ACTIVE_USER = "[Auth] UPDATE_ACTIVE_USER";
// export const ADD_ACTIVE_EMPLOYEE_COMPANY = "[Auth] ADD_ACTIVE_EMPLOYEE_COMPANY";
export const AUTH_FAILURE = "[Auth] AUTH_FAILURE";
export const CLEAR_ERROR = "[Auth] CLEAR_ERROR";
export const AUTO_LOGIN = "[Auth] AUTO_LOGIN";

export type AuthActions = SignupAttempt
                        | LoginAttempt
                        | AuthFailure
                        | AuthSuccess
                        | ClearError
                        | AutoLogin
                        // | AddActiveEmployeeCompany
                        | Logout
                        | UpdateActiveUser;


export class SignupAttempt implements Action {
  readonly type = SIGNUP_ATTEMPT;

  constructor(public payload: { 
      email: string,  password: string, confirmPassword: string, name?: string
  }){}
}

export class LoginAttempt implements Action {
  readonly type = LOGIN_ATTEMPT;

  constructor(public payload:
      { email: string,  password: string }
    ){}
}

export class AuthSuccess implements Action {
  readonly type = AUTH_SUCCESS;

  constructor(public payload: { user: Employee | Company, redirect: boolean }){}
}

export class UpdateActiveUser implements Action {
  readonly type = UPDATE_ACTIVE_USER;

  constructor(public payload: { user: Employee | Company }){}
}

// export class AddActiveEmployeeCompany implements Action {
//   readonly type = ADD_ACTIVE_EMPLOYEE_COMPANY;

//   constructor(public payload: Company){}
// }

export class AuthFailure implements Action {
  readonly type = AUTH_FAILURE;

  constructor(public payload: any[]){}
}

export class ClearError implements Action {
  readonly type = CLEAR_ERROR;
}
   
export class AutoLogin implements Action {
  readonly type = AUTO_LOGIN;
}

export class Logout implements Action {
  readonly type = LOGOUT;
}


