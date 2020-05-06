

import * as AuthActions from './auth.actions';



export interface State {
  messages: string[];
  loading: boolean;
  refreshing: boolean;
  token: string;
  refreshToken: string;
}

const initialState: State = {
  messages: null,
  loading: false,
  refreshing: false,
  token: null,
  refreshToken: null
};




const setUserTokensStorage = (token: string = null,
                              expiresInSeconds: number = null,
                              refreshToken: string = null) => {
  if (token) { localStorage.setItem('token', JSON.stringify(token)); }
  if (refreshToken) { localStorage.setItem('refreshToken', JSON.stringify(refreshToken)); }
  if (expiresInSeconds) {
    localStorage.setItem('expirationDate',
    JSON.stringify(new Date((new Date().getTime() + expiresInSeconds)).toISOString()));
  }
};



export function authReducer(state = initialState, action: AuthActions.AuthActions) {
  switch (action.type) {
    case AuthActions.REFRESH_TOKEN_ATTEMPT:
      return {
        ...state,
        refreshing: true,
      };
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
        refreshing: false,
        messages: action.payload,
      };
    case AuthActions.AUTH_SUCCESS:
      setUserTokensStorage(
      action.payload.token, action.payload.expiresInSeconds * 1000, action.payload.refreshToken );
      return {
        ...state,
        loading: false,
        refreshing: false,
        messages: null,
        token: action.payload['token'] ? action.payload['token'] : state.token,
        refreshToken: action.payload['refreshToken'] ? action.payload['refreshToken'] : state.refreshToken,
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
        refreshing: false,
        messages: null,
        token: null,
        refreshToken: null
      };
    default:
      return state;
  }
}
