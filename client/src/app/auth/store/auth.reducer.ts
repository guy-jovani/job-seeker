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

export function authReducer(state = initialState, action: AuthActions.AuthActions){
  // console.log("auth reducer " + action.type),
  switch(action.type){
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
    case AuthActions.AUTH_SUCCESS:
    case AuthActions.UPDATE_ACTIVE_USER:
      console.log('auth state after success: ', action.payload.user, action.payload.kind, action.payload['token']) ;
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
