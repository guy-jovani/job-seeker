

import * as AuthActions from './auth.actions';



export interface State {
  messages: any[];
  loading: boolean;
  token: string;
}

const initialState: State = {
  messages: null,
  loading: false,
  token: null
};

export function authReducer(state = initialState, action: AuthActions.AuthActions) {
  // console.log("auth reducer " + action.type),
  switch (action.type) {
    case AuthActions.SIGNUP_ATTEMPT:
    case AuthActions.LOGIN_ATTEMPT:
    case AuthActions.RESET_PASS_EMAIL_ATTEMPT:
    case AuthActions.RESET_PASS_ATTEMPT:
      return {
        ...state,
        messages: null,
        loading: true,
      };
    case AuthActions.AUTH_FAILURE:
      return {
        ...state,
        loading: false,
        messages: action.payload,
      };
    case AuthActions.AUTH_SUCCESS:
      return {
        ...state,
        loading: false,
        messages: null,
        token: action.payload['token'] ? action.payload['token'] : state.token,
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
        token: null
      };
    default:
      return state;
  }
}
