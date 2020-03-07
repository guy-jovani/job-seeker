import { Employee } from 'app/employees/employee.model';


import * as AuthActions from './auth.actions';
import { Company } from 'app/company/company.model';
import { Conversation } from 'app/chat/conversation.model';



export interface State {
  user: Employee | Company;
  messages: any[];
  loading: boolean;
  kind: string;
  token: string;
  notificatios: string[];
  conversations: Conversation[];
}

const initialState: State = {
  user: null,
  messages: null,
  loading: false,
  kind: null,
  token: null,
  notificatios: [],
  conversations: null
};

export function authReducer(state = initialState, action: AuthActions.AuthActions) {
  // console.log("auth reducer " + action.type),
  switch (action.type) {
    case AuthActions.SIGNUP_ATTEMPT:
    case AuthActions.LOGIN_ATTEMPT:
    case AuthActions.RESET_PASS_EMAIL_ATTEMPT:
    case AuthActions.RESET_PASS_ATTEMPT:
    case AuthActions.FETCH_ALL_CONVERSATIONS:
      return {
        ...state,
        loading: true,
      };
    case AuthActions.SET_CHAT_NOTIFICATION:
      const setNewNotifications = [...state.notificatios];
      if (setNewNotifications.findIndex(val => val === 'chat') === -1 ){
        setNewNotifications.push('chat');
      }
      return {
        ...state,
        loading: true,
        notificatios: [...setNewNotifications]
      };
    case AuthActions.REMOVE_CHAT_NOTIFICATION:
      const newNotifications = [...state.notificatios];
      const chatNotInd = newNotifications.findIndex(notification => notification === 'chat');
      if (chatNotInd !== -1) {
        newNotifications.splice(chatNotInd, 1);
      }
      return {
        ...state,
        loading: true,
        notificatios: newNotifications
      };
    case AuthActions.SET_ALL_CONVERSATIONS:
      return {
        ...state,
        loading: false,
        conversations: action.payload
      };
    case AuthActions.SET_SINGLE_CONVERSATION:
      const newConId = action.payload.conversation._id;

      const oldConId = state.conversations ? state.conversations.findIndex(con => con._id === newConId) : -1;
      const updatedCons = state.conversations ? [...state.conversations] : [];

      if (oldConId === -1) { // a new conversation
        action.payload.conversation.messages = [action.payload.message];
        updatedCons.push(action.payload.conversation);

      } else { // added message to an existing conversation
        const newMsg = action.payload.message;
        newMsg.createdAt = new Date(newMsg.createdAt);
        const oldMessagesLength = updatedCons[oldConId].messages.length;
        if ( oldMessagesLength ) {
          const lastMsgDate = new Date(updatedCons[oldConId].messages[oldMessagesLength - 1].createdAt);
          newMsg['first'] = lastMsgDate.toDateString() === newMsg.createdAt.toDateString() ? null : newMsg.createdAt.toDateString() ;
        } else { // no older messages
          newMsg['first'] = newMsg.createdAt.toDateString();
        }
        newMsg['hours'] = newMsg.createdAt.getHours().toString().padStart(2, '0');
        newMsg['minutes'] = newMsg.createdAt.getMinutes().toString().padStart(2, '0');
        updatedCons[oldConId].messages.push(action.payload.message);
      }
      return {
        ...state,
        loading: false,
        conversations: updatedCons
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
        notificatios: [],
        conversations: null,
        token: null
      };
    default:
      return state;
  }
}
