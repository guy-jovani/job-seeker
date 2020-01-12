import { Employee } from 'app/employees/employee.model';


import * as AuthActions from './auth.actions';



export interface State {
  employee: Employee,
  messages: any[],
  loading: boolean
}

const initialState: State = {
  employee: null,
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
    case AuthActions.ADD_ACTIVE_EMPLOYEE_COMPANY:
      let emp = { ...state.employee };
      emp.companiesCreated.push(action.payload._id);
      return {
        ...state, 
        loading: false, 
        messages: null,
        employee: { ...emp }
      };
    case AuthActions.AUTH_SUCCESS:
    case AuthActions.UPDATE_ACTIVE_EMPLOYEE:
      console.log("auth state after success: ", action.payload.employee) 
      return {
        ...state, 
        loading: false,
        messages: null,
        employee: {...action.payload.employee}
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
        employee: null
      };
    default:
      return state;
  }
}





















