

import { Action } from '@ngrx/store';
import { Company } from '../company.model';
import { Position } from 'app/position/position.model';

export const UPDATE_SINGLE_COMPANY = '[Company] Update single company';
export const UPDATE_SINGLE_COMPANY_POSITION = '[Company] Update single company position';
export const UPDATE_SINGLE_COMPANY_POSITION_ATTEMPT = '[Company] Update single company position attempt';
export const COMPANY_STATE_LOAD_SINGLE = '[POSITION] COMPANY_STATE_LOAD_SINGLE';
export const UPDATE_SINGLE_COMPANY_IN_DB = '[Company] Update single company in db';
export const SET_COMPANIES = '[Company] Set Companies';
export const FETCH_COMPANIES = '[Company] Fetch companies';
export const FETCH_SINGLE_COMPANY = '[Company] Fetch Single company';
export const COMPANY_OP_FAILURE = '[Company] Company operation failed';
export const CLEAR_ERROR = '[Company] Clear error';
export const LOGOUT = '[Company] LOGOUT';

export type CompanyActions = FetchCompanies
                            | FetchSingleCompany
                            | SetCompanies
                            | CompanyOpFailure
                            | ClearError
                            | CompanyStateLoadSingle
                            | UpdateSingleCompanyInDb
                            | UpdateSingleCompany
                            | UpdateSingleCompanyPositionAttempt
                            | UpdateSingleCompanyPosition
                            | Logout;


export class FetchCompanies implements Action {
  readonly type = FETCH_COMPANIES;

  constructor(public payload: { page: number } ) {}
}

export class CompanyStateLoadSingle implements Action {
  readonly type = COMPANY_STATE_LOAD_SINGLE;
}

export class UpdateSingleCompanyPositionAttempt implements Action {
  readonly type = UPDATE_SINGLE_COMPANY_POSITION_ATTEMPT;
}

export class FetchSingleCompany implements Action {
  readonly type = FETCH_SINGLE_COMPANY;

  constructor(public payload: { _id: string, main: boolean, posInd?: number }) {}
}

export class SetCompanies implements Action {
  readonly type = SET_COMPANIES;

  constructor(public payload: {companies: Company[], total: number}) {}
}

export class UpdateSingleCompanyPosition implements Action {
  readonly type = UPDATE_SINGLE_COMPANY_POSITION;

  constructor(public payload: Position) {}
}

export class UpdateSingleCompany implements Action {
  readonly type = UPDATE_SINGLE_COMPANY;

  constructor(public payload: { company: Company, main: boolean }) {}
}

export class UpdateSingleCompanyInDb implements Action {
  readonly type = UPDATE_SINGLE_COMPANY_IN_DB;

  constructor(public payload: {
    company: Company,
    oldImagesPath: string[],
    password: string,
    confirmPassword: string
  }) {}
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

