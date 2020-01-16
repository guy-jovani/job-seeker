import { Employee } from 'app/employees/employee.model';


import * as AuthActions from './auth.actions';
import { Company } from 'app/company/company.model';



export interface State {
  user: Employee | Company,
  messages: any[],
  loading: boolean
}

const initialState: State = {
  user: null,
  messages: null,
  loading: false
}

export function authReducer(state = initialState, action: AuthActions.AuthActions){
  // console.log("auth reducer " + action.type);
  switch(action.type){
    case AuthActions.SIGNUP_ATTEMPT:
    case AuthActions.LOGIN_ATTEMPT:
      return {
        ...state, 
        loading: true,
        messages: null,
      };
    case AuthActions.AUTH_FAILURE:
      return {
        ...state, 
        loading: false,
        messages: action.payload,
      };
    case AuthActions.AUTH_SUCCESS:
    case AuthActions.UPDATE_ACTIVE_USER:
      console.log("auth state after success: ", action.payload.user) 
      return {
        ...state, 
        loading: false,
        messages: null,
        user: { ...action.payload.user }
      };
    case AuthActions.CLEAR_ERROR:
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
        user: null
      };
    default:
      return state;
  }
}





















