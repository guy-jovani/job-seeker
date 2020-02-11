

import { Action } from '@ngrx/store';
import { Company } from '../company.model';

// export const STORE_COMPANY_IN_DB = "[Company] STORE company in db";
// export const SET_SINGLE_COMPANY = "[Company] Set single company";
export const UPDATE_SINGLE_COMPANY = "[Company] Update single company";
export const UPDATE_SINGLE_COMPANY_IN_DB = "[Company] Update single company in db";
export const SET_ALL_COMPANIES = "[Company] Set All Companies";
export const FETCH_ALL_COMPANIES = "[Company] Fetch All companies";
export const FETCH_SINGLE_COMPANY = "[Company] Fetch Single company";
export const COMPANY_OP_FAILURE = "[Company] Company operation failed";
export const CLEAR_ERROR = "[Company] Clear error";
export const LOGOUT = "[Company] LOGOUT";

export type CompanyActions = FetchAllCompanies
                            | FetchSingleCompany
                            | SetAllCompanies
                            | CompanyOpFailure
                            | ClearError
                            | UpdateSingleCompanyInDb
                            // | SetSingleCompany
                            | UpdateSingleCompany
                            // | StoreCompanyInDb
                            | Logout;


export class FetchAllCompanies implements Action {
  readonly type = FETCH_ALL_COMPANIES;
}

export class FetchSingleCompany implements Action {
  readonly type = FETCH_SINGLE_COMPANY;

  constructor(public payload: string){}
}

export class SetAllCompanies implements Action {
  readonly type = SET_ALL_COMPANIES;

  constructor(public payload: Company[]){}
}

export class UpdateSingleCompany implements Action {
  readonly type = UPDATE_SINGLE_COMPANY;

  constructor(public payload: { company: Company }) {}
}

export class UpdateSingleCompanyInDb implements Action {
  readonly type = UPDATE_SINGLE_COMPANY_IN_DB;

  constructor(public payload: { company: Company, deleteImage: boolean }) {}
}

export class CompanyOpFailure implements Action {
  readonly type = COMPANY_OP_FAILURE;

  constructor(public payload: any[]){}
}

export class ClearError implements Action {
  readonly type = CLEAR_ERROR;
}

export class Logout implements Action {
  readonly type = LOGOUT;
}



// export class StoreCompanyInDb implements Action {
//   readonly type = STORE_COMPANY_IN_DB;

//   constructor(public payload: Company){}
// }
// export class SetSingleCompany implements Action {
//   readonly type = SET_SINGLE_COMPANY;

//   constructor(public payload: { company: Company, redirect: boolean }){}
// }
