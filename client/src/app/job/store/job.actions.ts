





import { Action } from '@ngrx/store';
import { Job } from '../job.model';
import { Company } from 'app/company/company.model';

export const JOB_STATE_LOAD_SINGLE = '[JOB] JOB_STATE_LOAD_SINGLE';

export const FETCH_JOBS = '[JOB] Fetch JOBS';
export const SET_JOBS = '[JOB] Set JOBS';
export const FETCH_SINGLE_JOB = '[JOB] Fetch Single JOB';
export const SET_SINGLE_JOB = '[JOB] Set single JOB';

export const JOB_OP_FAILURE = '[JOB] JOB operation failed';
export const CLEAR_ERROR = '[JOB] Clear error';
export const LOGOUT = '[JOB] LOGOUT';

// when looking into a company after seeing its job
export const UPDATE_SINGLE_JOB_COMPANY = '[JOB] UPDATE_SINGLE_JOB_COMPANY';
export const UPDATE_SINGLE_JOB_COMPANY_ATTEMPT = '[JOB] UPDATE_SINGLE_JOB_COMPANY_ATTEMPT';


export type JobActions = SetSingleJob
                        | FetchJobs
                        | SetJobs
                        | ClearError
                        | Logout
                        | JobStateLoadSingle
                        | UpdateSingleJobCompanyAttempt
                        | UpdateSingleJobCompany
                        | FetchSingleJob
                        | JobOpFailure;


export class SetJobs implements Action {
  readonly type = SET_JOBS;

  constructor(public payload: { jobs: Job[], total: number }) {}
}

export class ClearError implements Action {
  readonly type = CLEAR_ERROR;
}

export class JobStateLoadSingle implements Action {
  readonly type = JOB_STATE_LOAD_SINGLE;
}

export class UpdateSingleJobCompanyAttempt implements Action {
  readonly type = UPDATE_SINGLE_JOB_COMPANY_ATTEMPT;
}

export class Logout implements Action {
  readonly type = LOGOUT;
}

export class JobOpFailure implements Action {
  readonly type = JOB_OP_FAILURE;

  constructor(public payload: string[] ) {}
}

export class SetSingleJob implements Action {
  readonly type = SET_SINGLE_JOB;

  constructor(public payload: { job: Job, main: boolean } ) {}
}

export class UpdateSingleJobCompany implements Action {
  readonly type = UPDATE_SINGLE_JOB_COMPANY;

  constructor(public payload: { company: Company, jobInd: number }) {}
}

export class FetchJobs implements Action {
  readonly type = FETCH_JOBS;

  constructor(public payload: { page: number } ) {}
}

export class FetchSingleJob implements Action {
  readonly type = FETCH_SINGLE_JOB;

  constructor(public payload: { _id: string, main: boolean } ) {}
}

