



import { Position } from '../position.model';
import * as PositionActions from './position.actions';



export interface State {
  positions: Position[];
  loadingAll: boolean;
  loadingSingle: boolean;
  messages: any[];
  lastFetch: Date;
}

const initialState: State = {
  positions: [],
  messages: null,
  loadingAll: false,
  loadingSingle: false,
  lastFetch: null
};

export function positionReducer(state = initialState, action: PositionActions.PositionActions) {
  switch (action.type) {
    case PositionActions.CREATE_POSITION_IN_DB:
      return {
        ...state,
        loadingAll: false,
        loadingSingle: true,
      };
    case PositionActions.FETCH_ALL_POSITIONS:
      return {
        ...state,
        loadingAll: true,
      };
    case PositionActions.FETCH_SINGLE_POSITION:
    case PositionActions.UPDATE_SINGLE_POSITION_COMPANY_ATTEMPT:
      return {
        ...state,
        loadingSingle: true,
      };
    case PositionActions.CLEAR_ERROR:
      return {
        ...state,
        loadingSingle: false,
        messages: null,
        loadingAll: false,
      };
    case PositionActions.LOGOUT:
      return {
        ...state,
        loadingSingle: false,
        messages: null,
        loadingAll: false,
        positions: [],
        tempPosition: null,
        lastFetch: null
      };
    case PositionActions.SET_ALL_POSITIONS:
      return {
        ...state,
        positions: [...action.payload],
        loadingAll: false,
        messages: null,
        lastFetch: new Date()
      };
    case PositionActions.POSITION_OP_FAILURE:
      return {
        ...state,
        messages: action.payload,
        loadingAll: false,
        loadingSingle: false,
      };
    case PositionActions.UPDATE_SINGLE_POSITION_COMPANY:
      action.payload.company.lastFetch = new Date();
      const upToDatePos = {
        ...state.positions[action.payload.posInd],
        companyId: action.payload.company
      };
      const upToDatePositions = [ ...state.positions ];
      upToDatePositions[action.payload.posInd] = upToDatePos;
      return {
        ...state,
        messages: null,
        positions: upToDatePositions
      };
    case PositionActions.UPDATE_SINGLE_POSITION:
      const index = state.positions.findIndex(pos => pos._id === action.payload.position._id);
      const updatedPositions = [...state.positions];
      const updatedPosition = {
          ...action.payload.position
        };
      if (index > -1) {
        updatedPositions[index] = updatedPosition;
      } else {
        updatedPositions.push(updatedPosition);
      }
      return {
        ...state,
        messages: null,
        positions: [ ...updatedPositions],
        loadingAll: false,
        loadingSingle: false,
      };
    default:
      return state;
  }
}























