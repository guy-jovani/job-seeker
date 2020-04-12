

import { Action } from '@ngrx/store';

export const SIGNUP_ATTEMPT = '[Auth] SIGNUP_ATTEMPT';
export const REFRESH_TOKEN_ATTEMPT = '[Auth] REFRESH_TOKEN_ATTEMPT';
export const LOGIN_ATTEMPT = '[Auth] LOGIN_ATTEMPT';
export const LOGOUT = '[Auth] LOGOUT';
export const AUTH_SUCCESS = '[Auth] AUTH_SUCCESS';
export const AUTH_FAILURE = '[Auth] AUTH_FAILURE';
export const CLEAR_ERROR = '[Auth] CLEAR_ERROR';
export const AUTO_LOGIN = '[Auth] AUTO_LOGIN';
export const RESET_PASS_EMAIL_ATTEMPT = '[Auth] RESET_PASS_EMAIL_ATTEMPT';
export const RESET_PASS_EMAIL_SUCCESS = '[Auth] RESET_PASS_EMAIL_SUCCESS';
export const RESET_PASS_ATTEMPT = '[Auth] RESET_PASS_ATTEMPT';
export const RESET_PASS_SUCCESS = '[Auth] RESET_PASS_SUCCESS';


export type AuthActions = SignupAttempt
                        | LoginAttempt
                        | AuthFailure
                        | RefreshTokenAttempt
                        | AuthSuccess
                        | ClearError
                        | AutoLogin
                        | ResetPassEmailSuccess
                        | ResetPassEmailAttempt
                        | ResetPassSuccess
                        | ResetPassAttempt
                        | Logout;



export class SignupAttempt implements Action {
  readonly type = SIGNUP_ATTEMPT;

  constructor(public payload: {
      email: string,  password: string, confirmPassword: string, name?: string
  }) {}
}

export class ResetPassEmailAttempt implements Action {
  readonly type = RESET_PASS_EMAIL_ATTEMPT;

  constructor(public payload: string) {}
}

export class RefreshTokenAttempt implements Action {
  readonly type = REFRESH_TOKEN_ATTEMPT;
}

export class ResetPassAttempt implements Action {
  readonly type = RESET_PASS_ATTEMPT;

  constructor(public payload: { password: string, confirmPassword: string, token: string }) {}
}

export class LoginAttempt implements Action {
  readonly type = LOGIN_ATTEMPT;

  constructor(public payload:
      { email: string,  password: string }
    ) {}
}

export class AuthSuccess implements Action {
  readonly type = AUTH_SUCCESS;

  constructor(public payload: { redirect: boolean, token: string,  expiresInSeconds: number, refreshToken?: string }) {}
}

export class AuthFailure implements Action {
  readonly type = AUTH_FAILURE;

  constructor(public payload: string[]) {}
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

export class ResetPassEmailSuccess implements Action {
  readonly type = RESET_PASS_EMAIL_SUCCESS;
}

export class ResetPassSuccess implements Action {
  readonly type = RESET_PASS_SUCCESS;
}


