

import { Action } from '@ngrx/store';
import { Company } from 'app/company/company.model';
import { Conversation } from 'app/chat/conversation.model';
import { Message } from 'app/chat/message.model';
import { Employee } from 'app/employees/employee.model';
import { Position } from '../../position/position.model';


export const UPDATE_ACTIVE_USER = '[User] UPDATE_ACTIVE_USER';
export const COMPANY_CREATED_POSITION = '[User] COMPANY_CREATED_POSITION';
export const COMPANY_UPDATED_POSITION = '[User] COMPANY_UPDATED_POSITION';
export const LOGOUT = '[User] LOGOUT';
export const USER_FAILURE = '[User] USER_FAILURE';
export const CLEAR_ERROR = '[User] CLEAR_ERROR';
export const FETCH_ALL_CONVERSATIONS = '[User] FETCH_ALL_CONVERSATIONS';
export const SET_ALL_CONVERSATIONS = '[User] SET_ALL_CONVERSATIONS';
export const SET_SINGLE_CONVERSATION = '[User] SET_SINGLE_CONVERSATION';
export const SET_CHAT_NOTIFICATION = '[User] SET_CHAT_NOTIFICATION';
export const REMOVE_CHAT_NOTIFICATION = '[User] REMOVE_CHAT_NOTIFICATION';
export const EMPLOYEE_APPLY_SAVE_POSITION_ATTEMPT = '[User] EMPLOYEE_APPLY_SAVE_POSITION_ATTEMPT';
export const COMPANY_ACCEPT_REJECT_POSITION_ATTEMPT = '[User] COMPANY_ACCEPT_REJECT_POSITION_ATTEMPT';


export type UserActions = SetChatNotification
                        | SetSingleConversation
                        | RemoveChatNotification
                        | SetAllConversations
                        | FetchAllConversations
                        | CompanyUpdatedPosition
                        | ClearError
                        | EmployeeApplySavePositionAttempt
                        | CompanyAcceptRejectPositionAttempt
                        | CompanyCreatedPosition
                        | Logout
                        | UserFailure
                        | UpdateActiveUser;


export class FetchAllConversations implements Action {
  readonly type = FETCH_ALL_CONVERSATIONS;
}

export class EmployeeApplySavePositionAttempt implements Action {
  readonly type = EMPLOYEE_APPLY_SAVE_POSITION_ATTEMPT;
}

export class CompanyAcceptRejectPositionAttempt implements Action {
  readonly type = COMPANY_ACCEPT_REJECT_POSITION_ATTEMPT;
}

export class UserFailure implements Action {
  readonly type = USER_FAILURE;

  constructor(public payload: string[]) {}
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

  constructor(public payload: { conversation: Conversation, stringMessage?: Message, fileMessage?: Message }) {}
}

export class UpdateActiveUser implements Action {
  readonly type = UPDATE_ACTIVE_USER;

  constructor(public payload: { user: Employee | Company, kind: string, redirect?: string }) {}
}

export class CompanyCreatedPosition implements Action {
  readonly type = COMPANY_CREATED_POSITION;

  constructor(public payload: Position) {}
}

export class CompanyUpdatedPosition implements Action {
  readonly type = COMPANY_UPDATED_POSITION;

  constructor(public payload: Position) {}
}

export class ClearError implements Action {
  readonly type = CLEAR_ERROR;
}

export class Logout implements Action {
  readonly type = LOGOUT;
}

