





import { Action } from '@ngrx/store';
import { Position } from '../position.model';
import { Company } from 'app/company/company.model';

export const CREATE_POSITION_IN_DB = '[Position] CREATE_POSITION_IN_DB';
export const POSITION_OP_FAILURE = '[POSITION] POSITION operation failed';
export const POSITION_STATE_LOAD_SINGLE = '[POSITION] POSITION_STATE_LOAD_SINGLE';
export const ADD_UPDATE_SINGLE_POSITION = '[POSITION] Add update single position';
export const UPDATE_SINGLE_POSITION_IN_DB = '[POSITION] Update single position in db';
export const FETCH_ALL_POSITIONS = '[POSITION] Fetch All POSITIONS';
export const FETCH_SINGLE_POSITION = '[POSITION] Fetch Single POSITION';
export const SET_ALL_POSITIONS = '[POSITION] Set All POSITIONS';
export const CLEAR_ERROR = '[POSITION] Clear error';
export const LOGOUT = '[POSITION] LOGOUT';
export const UPDATE_SINGLE_POSITION_COMPANY = '[POSITION] UPDATE_SINGLE_POSITION_COMPANY';
export const UPDATE_SINGLE_POSITION_COMPANY_ATTEMPT = '[POSITION] UPDATE_SINGLE_POSITION_COMPANY_ATTEMPT';


export type PositionActions = CreatePositionInDb
                            | PositionOpFailure
                            | AddUpdateSinglePosition
                            | FetchAllPositions
                            | SetAllPositions
                            | ClearError
                            | Logout
                            | PositionStateLoadSingle
                            | UpdateSinglePositionCompanyAttempt
                            | UpdateSinglePositionCompany
                            | FetchSinglePosition;


export class SetAllPositions implements Action {
  readonly type = SET_ALL_POSITIONS;

  constructor(public payload: Position[] ) {}
}

export class ClearError implements Action {
  readonly type = CLEAR_ERROR;
}

export class PositionStateLoadSingle implements Action {
  readonly type = POSITION_STATE_LOAD_SINGLE;
}

export class UpdateSinglePositionCompanyAttempt implements Action {
  readonly type = UPDATE_SINGLE_POSITION_COMPANY_ATTEMPT;
}

export class Logout implements Action {
  readonly type = LOGOUT;
}

export class CreatePositionInDb implements Action {
  readonly type = CREATE_POSITION_IN_DB;

  constructor(public payload: Position ) {}
}

export class PositionOpFailure implements Action {
  readonly type = POSITION_OP_FAILURE;

  constructor(public payload: string[] ) {}
}

export class AddUpdateSinglePosition implements Action {
  readonly type = ADD_UPDATE_SINGLE_POSITION;

  constructor(public payload: { position: Position, main: boolean } ) {}
}

export class UpdateSinglePositionCompany implements Action {
  readonly type = UPDATE_SINGLE_POSITION_COMPANY;

  constructor(public payload: { company: Company, posInd: number }) {}
}

export class UpdateSinglePositionInDb implements Action {
  readonly type = UPDATE_SINGLE_POSITION_IN_DB;

  constructor(public payload: Position ) {}
}

export class FetchAllPositions implements Action {
  readonly type = FETCH_ALL_POSITIONS;
}

export class FetchSinglePosition implements Action {
  readonly type = FETCH_SINGLE_POSITION;

  constructor(public payload: { _id: string, main: boolean } ) {}
}

