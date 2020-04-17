

import { Action } from '@ngrx/store';
import { Company } from 'app/company/company.model';
import { Conversation } from 'app/chat/conversation.model';
import { Message } from 'app/chat/message.model';
import { Employee, Work } from 'app/employees/employee.model';
import { Job } from '../../job/job.model';


export const UPDATE_ACTIVE_USER = '[User] UPDATE_ACTIVE_USER';
export const LOGOUT = '[User] LOGOUT';
export const USER_FAILURE = '[User] USER_FAILURE';
export const CLEAR_ERROR = '[User] CLEAR_ERROR';


export const COMPANY_CREATE_JOB_IN_DB = '[User] COMPANY_CREATE_JOB_IN_DB';
export const COMPANY_CREATED_JOB = '[User] COMPANY_CREATED_JOB';
export const COMPANY_UPDATE_JOB_IN_DB = '[User] COMPANY Update single JOB in db';
export const COMPANY_UPDATED_JOB = '[User] COMPANY UPDATED_JOB';

export const FETCH_ALL_CONVERSATIONS = '[User] FETCH_ALL_CONVERSATIONS';
export const SET_ALL_CONVERSATIONS = '[User] SET_ALL_CONVERSATIONS';
export const SET_SINGLE_CONVERSATION = '[User] SET_SINGLE_CONVERSATION';

export const REMOVE_CHAT_NOTIFICATION = '[User] REMOVE_CHAT_NOTIFICATION';
export const SET_CHAT_NOTIFICATION = '[User] SET_CHAT_NOTIFICATION';

export const CREATE_WORK_EMPLOYEE_IN_DB = '[User] CREATE_WORK_EMPLOYEE_IN_DB';
export const CREATED_WORK_EMPLOYEE = '[User] CREATED_WORK_EMPLOYEE';
export const UPDATE_WORK_EMPLOYEE_IN_DB = '[User] UPDATE_WORK_EMPLOYEE_IN_DB';
export const UPDATED_WORK_EMPLOYEE = '[User] UPDATED_WORK_EMPLOYEE';
export const DELETE_WORK_EMPLOYEE_IN_DB = '[User] DELETE_WORK_EMPLOYEE_IN_DB';
export const DELETED_WORK_EMPLOYEE = '[User] DELETED_WORK_EMPLOYEE';

export const EMPLOYEE_APPLY_SAVE_JOB_ATTEMPT = '[User] EMPLOYEE_APPLY_SAVE_JOB_ATTEMPT';
export const COMPANY_ACCEPT_REJECT_JOB_ATTEMPT = '[User] COMPANY_ACCEPT_REJECT_JOB_ATTEMPT';

export const UPDATE_SINGLE_EMPLOYEE_IN_DB = '[User] Update single Employee in DB';
export const UPDATE_SINGLE_COMPANY_IN_DB = '[User] Update single company in db';

export const CHANGE_USER_PASSWORD = '[User] CHANGE_USER_PASSWORD';


export type UserActions = SetChatNotification
                        | SetSingleConversation
                        | RemoveChatNotification
                        | SetAllConversations
                        | FetchAllConversations
                        | CreateWorkEmployeeInDb
                        | DeleteWorkEmployeeInDb
                        | ClearError
                        | UpdateSingleEmployeeInDB
                        | UpdateSingleCompanyInDb
                        | UpdateWorkEmployeeInDb
                        | UpdatedWorkEmployee
                        | EmployeeApplySaveJobAttempt
                        | CompanyAcceptRejectJobAttempt
                        | Logout
                        | CreatedWorkEmployee
                        | UserFailure
                        | DeletedWorkEmployee
                        | ChangeUserPassword
                        | CompanyUpdateJobInDb
                        | CompanyCreateJobInDb
                        | CompanyUpdatedJob
                        | CompanyCreatedJob
                        | UpdateActiveUser;



export class FetchAllConversations implements Action {
  readonly type = FETCH_ALL_CONVERSATIONS;
}

export class CompanyCreateJobInDb implements Action {
  readonly type = COMPANY_CREATE_JOB_IN_DB;

  constructor(public payload: Job ) {}
}

export class ChangeUserPassword implements Action {
  readonly type = CHANGE_USER_PASSWORD;

  constructor(public payload: {
    currPassword: string,
    newPassword: string,
    confirmNewPassword: string,
    kind: string
  } ) {}
}

export class CompanyUpdateJobInDb implements Action {
  readonly type = COMPANY_UPDATE_JOB_IN_DB;

  constructor(public payload: Job ) {}
}

export class UpdateSingleCompanyInDb implements Action {
  readonly type = UPDATE_SINGLE_COMPANY_IN_DB;

  constructor(public payload: {
    company: Company,
    oldImagesPath: string[]
  }) {}
}

export class UpdateSingleEmployeeInDB implements Action {
  readonly type = UPDATE_SINGLE_EMPLOYEE_IN_DB;

  constructor(public payload: { employee: Employee, deleteImage: boolean }) {}
}

export class DeleteWorkEmployeeInDb implements Action {
  readonly type = DELETE_WORK_EMPLOYEE_IN_DB;

  constructor( public payload: string ) {}
}

export class DeletedWorkEmployee implements Action {
  readonly type = DELETED_WORK_EMPLOYEE;

  constructor( public payload: string ) {}
}

export class CreateWorkEmployeeInDb implements Action {
  readonly type = CREATE_WORK_EMPLOYEE_IN_DB;

  constructor( public payload: {
    title: string,
    company: string,
    startDate: string,
    present: boolean,
    endDate: string,
    employmentType?: string
  } ) {}
}

export class UpdateWorkEmployeeInDb implements Action {
  readonly type = UPDATE_WORK_EMPLOYEE_IN_DB;

  constructor( public payload: {
    workId: string,
    title: string,
    company: string,
    startDate: string,
    present: boolean,
    endDate: string,
    employmentType?: string
  } ) {}
}

export class UpdatedWorkEmployee implements Action {
  readonly type = UPDATED_WORK_EMPLOYEE;

  constructor( public payload: Work ) {}
}

export class CreatedWorkEmployee implements Action {
  readonly type = CREATED_WORK_EMPLOYEE;

  constructor( public payload: Work ) {}
}

export class EmployeeApplySaveJobAttempt implements Action {
  readonly type = EMPLOYEE_APPLY_SAVE_JOB_ATTEMPT;
}

export class CompanyAcceptRejectJobAttempt implements Action {
  readonly type = COMPANY_ACCEPT_REJECT_JOB_ATTEMPT;
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

export class CompanyCreatedJob implements Action {
  readonly type = COMPANY_CREATED_JOB;

  constructor(public payload: Job) {}
}

export class CompanyUpdatedJob implements Action {
  readonly type = COMPANY_UPDATED_JOB;

  constructor(public payload: Job) {}
}

export class ClearError implements Action {
  readonly type = CLEAR_ERROR;
}

export class Logout implements Action {
  readonly type = LOGOUT;
}

