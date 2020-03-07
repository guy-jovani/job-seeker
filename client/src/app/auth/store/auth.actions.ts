

import { Action } from '@ngrx/store';
import { Company } from 'app/company/company.model';
import { Conversation } from 'app/chat/conversation.model';
import { Message } from 'app/chat/message.model';
import { Employee } from 'app/employees/employee.model';
import { Position } from '../../position/position.model';

export const SIGNUP_ATTEMPT = '[Auth] SIGNUP_ATTEMPT';
export const LOGIN_ATTEMPT = '[Auth] LOGIN_ATTEMPT';
export const LOGOUT = '[Auth] LOGOUT';
export const AUTH_SUCCESS = '[Auth] AUTH_SUCCESS';
export const UPDATE_ACTIVE_USER = '[Auth] UPDATE_ACTIVE_USER';
export const ADD_POSITION_TO_USER = '[Auth] ADD_POSITION_TO_USER';
export const UPDATE_POSITION_OF_USER = '[Auth] UPDATE_POSITION_OF_USER';
export const AUTH_FAILURE = '[Auth] AUTH_FAILURE';
export const CLEAR_ERROR = '[Auth] CLEAR_ERROR';
export const AUTO_LOGIN = '[Auth] AUTO_LOGIN';
export const RESET_PASS_EMAIL_ATTEMPT = '[Auth] RESET_PASS_EMAIL_ATTEMPT';
export const RESET_PASS_EMAIL_SUCCESS = '[Auth] RESET_PASS_EMAIL_SUCCESS';
export const RESET_PASS_ATTEMPT = '[Auth] RESET_PASS_ATTEMPT';
export const RESET_PASS_SUCCESS = '[Auth] RESET_PASS_SUCCESS';
export const FETCH_ALL_CONVERSATIONS = '[Auth] FETCH_ALL_CONVERSATIONS';
export const SET_ALL_CONVERSATIONS = '[Auth] SET_ALL_CONVERSATIONS';
export const SET_SINGLE_CONVERSATION = '[Auth] SET_SINGLE_CONVERSATION';
export const SET_CHAT_NOTIFICATION = '[Auth] SET_CHAT_NOTIFICATION';
export const REMOVE_CHAT_NOTIFICATION = '[Auth] REMOVE_CHAT_NOTIFICATION';


export type AuthActions = SignupAttempt
                        | LoginAttempt
                        | AuthFailure
                        | AuthSuccess
                        | ClearError
                        | AutoLogin
                        | ResetPassEmailSuccess
                        | ResetPassEmailAttempt
                        | ResetPassSuccess
                        | ResetPassAttempt
                        | Logout
                        | SetChatNotification
                        | SetSingleConversation
                        | RemoveChatNotification
                        | SetAllConversations
                        | FetchAllConversations
                        | UpdatePositionOfUser
                        | AddPositionToUser
                        | UpdateActiveUser;



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

export class FetchAllConversations implements Action {
  readonly type = FETCH_ALL_CONVERSATIONS;
}

export class SetChatNotification implements Action {
  readonly type = SET_CHAT_NOTIFICATION;
}

export class RemoveChatNotification implements Action {
  readonly type = REMOVE_CHAT_NOTIFICATION;
}

export class SetAllConversations implements Action {
  readonly type = SET_ALL_CONVERSATIONS;

  constructor(public payload: Conversation[]) {}
}

export class SetSingleConversation implements Action {
  readonly type = SET_SINGLE_CONVERSATION;

  constructor(public payload: { conversation: Conversation, message: Message }) {}
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

  constructor(public payload: {
    user: Employee | Company, redirect: boolean, kind: string, token: string }) {}
}

export class UpdateActiveUser implements Action {
  readonly type = UPDATE_ACTIVE_USER;

  constructor(public payload: { user: Employee | Company, kind: string }) {}
}

export class AddPositionToUser implements Action {
  readonly type = ADD_POSITION_TO_USER;

  constructor(public payload: Position) {}
}

export class UpdatePositionOfUser implements Action {
  readonly type = UPDATE_POSITION_OF_USER;

  constructor(public payload: Position) {}
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


