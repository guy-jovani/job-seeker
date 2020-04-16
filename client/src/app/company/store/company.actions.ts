

import { Action } from '@ngrx/store';
import { Company } from '../company.model';

export const FETCH_SINGLE_COMPANY = '[Company] Fetch Single company';
export const SET_SINGLE_COMPANY = '[Company] Set single company';
export const FETCH_COMPANIES = '[Company] Fetch companies';
export const SET_COMPANIES = '[Company] Set Companies';

export const COMPANY_STATE_LOAD_SINGLE = '[Company] COMPANY_STATE_LOAD_SINGLE';

export const COMPANY_OP_FAILURE = '[Company] Company operation failed';
export const CLEAR_ERROR = '[Company] Clear error';
export const LOGOUT = '[Company] LOGOUT';

export type CompanyActions = FetchCompanies
                            | FetchSingleCompany
                            | SetCompanies
                            | CompanyOpFailure
                            | ClearError
                            | CompanyStateLoadSingle
                            | SetSingleCompany
                            | Logout;


export class FetchCompanies implements Action {
  readonly type = FETCH_COMPANIES;

  constructor(public payload: { page: number } ) {}
}

export class CompanyStateLoadSingle implements Action {
  readonly type = COMPANY_STATE_LOAD_SINGLE;
}

export class FetchSingleCompany implements Action {
  readonly type = FETCH_SINGLE_COMPANY;

  constructor(public payload: { _id: string, main: boolean, jobInd?: number }) {}
}

export class SetCompanies implements Action {
  readonly type = SET_COMPANIES;

  constructor(public payload: {companies: Company[], total: number}) {}
}

export class SetSingleCompany implements Action {
  readonly type = SET_SINGLE_COMPANY;

  constructor(public payload: { company: Company, main: boolean }) {}
}

export class CompanyOpFailure implements Action {
  readonly type = COMPANY_OP_FAILURE;

  constructor(public payload: string[]) {}
}

export class ClearError implements Action {
  readonly type = CLEAR_ERROR;
}

export class Logout implements Action {
  readonly type = LOGOUT;
}

