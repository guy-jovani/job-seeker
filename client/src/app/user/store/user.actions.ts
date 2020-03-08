

import { Action } from '@ngrx/store';
import { Company } from 'app/company/company.model';
import { Conversation } from 'app/chat/conversation.model';
import { Message } from 'app/chat/message.model';
import { Employee } from 'app/employees/employee.model';
import { Position } from '../../position/position.model';


export const UPDATE_ACTIVE_USER = '[User] UPDATE_ACTIVE_USER';
export const ADD_POSITION_TO_USER = '[User] ADD_POSITION_TO_USER';
export const UPDATE_POSITION_OF_USER = '[User] UPDATE_POSITION_OF_USER';
export const LOGOUT = '[User] LOGOUT';
export const USER_FAILURE = '[User] USER_FAILURE';
export const CLEAR_ERROR = '[User] CLEAR_ERROR';
export const FETCH_ALL_CONVERSATIONS = '[User] FETCH_ALL_CONVERSATIONS';
export const SET_ALL_CONVERSATIONS = '[User] SET_ALL_CONVERSATIONS';
export const SET_SINGLE_CONVERSATION = '[User] SET_SINGLE_CONVERSATION';
export const SET_CHAT_NOTIFICATION = '[User] SET_CHAT_NOTIFICATION';
export const REMOVE_CHAT_NOTIFICATION = '[User] REMOVE_CHAT_NOTIFICATION';


export type UserActions = SetChatNotification
                        | SetSingleConversation
                        | RemoveChatNotification
                        | SetAllConversations
                        | FetchAllConversations
                        | UpdatePositionOfUser
                        | ClearError
                        | AddPositionToUser
                        | Logout
                        | UserFailure
                        | UpdateActiveUser;


export class FetchAllConversations implements Action {
  readonly type = FETCH_ALL_CONVERSATIONS;
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

  constructor(public payload: { conversation: Conversation, message: Message }) {}
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

export class ClearError implements Action {
  readonly type = CLEAR_ERROR;
}

export class Logout implements Action {
  readonly type = LOGOUT;
}

