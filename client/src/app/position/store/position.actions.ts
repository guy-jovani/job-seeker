





import { Action } from '@ngrx/store';
import { Position } from '../position.model';

export const CREATE_POSITION_IN_DB = '[Position] CREATE_POSITION_IN_DB';
export const POSITION_OP_FAILURE = '[POSITION] POSITION operation failed';
export const UPDATE_SINGLE_POSITION = '[POSITION] Update single position';
export const UPDATE_SINGLE_POSITION_IN_DB = '[POSITION] Update single position in db';
export const FETCH_ALL_POSITIONS = '[POSITION] Fetch All POSITIONS';
export const FETCH_SINGLE_POSITION = '[POSITION] Fetch Single POSITION';
export const SET_ALL_POSITIONS = '[POSITION] Set All POSITIONS';
export const CLEAR_ERROR = '[POSITION] Clear error';
export const LOGOUT = '[POSITION] LOGOUT';



export type PositionActions = CreatePositionInDb
                            | PositionOpFailure
                            | UpdateSinglePosition
                            | FetchAllPositions
                            | SetAllPositions
                            | ClearError
                            | Logout
                            | FetchSinglePosition;


export class SetAllPositions implements Action {
  readonly type = SET_ALL_POSITIONS;

  constructor(public payload: Position[] ) {}
}

export class ClearError implements Action {
  readonly type = CLEAR_ERROR;
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

export class UpdateSinglePosition implements Action {
  readonly type = UPDATE_SINGLE_POSITION;

  constructor(public payload: { position: Position, main: boolean } ) {}
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

