import { Employee } from 'app/employees/employee.model';


import * as AuthActions from './auth.actions';
import { Company } from 'app/company/company.model';



export interface State {
  user: Employee | Company;
  messages: any[];
  loading: boolean;
  kind: string;
  token: string;
}

const initialState: State = {
  user: null,
  messages: null,
  loading: false,
  kind: null,
  token: null
};

export function authReducer(state = initialState, action: AuthActions.AuthActions) {
  switch (action.type) {
    case AuthActions.SIGNUP_ATTEMPT:
    case AuthActions.LOGIN_ATTEMPT:
    case AuthActions.RESET_PASS_EMAIL_ATTEMPT:
    case AuthActions.RESET_PASS_ATTEMPT:
      return {
        ...state,
        loading: true,
      };
    case AuthActions.AUTH_FAILURE:
      return {
        ...state,
        loading: false,
        messages: action.payload,
      };
    case AuthActions.ADD_POSITION_TO_USER:
      const updatedPositions = [ ...state.user.positions, action.payload ];
      const updatedUser = {
        ...state.user,
        positions: updatedPositions
      };
      return {
        ...state,
        user: updatedUser,
      };
    case AuthActions.UPDATE_POSITION_OF_USER:
      const positions = [...state.user.positions];
      const posInd = state.user.positions.findIndex(pos => pos._id === action.payload._id);
      positions[posInd] = action.payload;
      const upToDateUser = {
        ...state.user,
        positions
      };
      return {
        ...state,
        user: upToDateUser,
      };
    case AuthActions.AUTH_SUCCESS:
    case AuthActions.UPDATE_ACTIVE_USER:
      return {
        ...state,
        loading: false,
        messages: null,
        kind: action.payload.kind,
        token: action.payload['token'] ? action.payload['token'] : state.token,
        user: action.payload.user ? { ...action.payload.user } : null
      };
    case AuthActions.CLEAR_ERROR:
    case AuthActions.RESET_PASS_EMAIL_SUCCESS:
    case AuthActions.RESET_PASS_SUCCESS:
      return {
        ...state,
        loading: false,
        messages: null,
      };
    case AuthActions.LOGOUT:
      return {
        ...state,
        loading: false,
        messages: null,
        user: null,
        kind: null,
        token: null
      };
    default:
      return state;
  }
}
