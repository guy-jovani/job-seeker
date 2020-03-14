import { Employee } from 'app/employees/employee.model';


import * as UserActions from './user.actions';
import { Company } from 'app/company/company.model';
import { Conversation } from 'app/chat/conversation.model';
import { Position } from 'app/position/position.model';



export interface State {
  user: Employee | Company;
  messages: string[];
  loading: boolean;
  kind: string;
  notificatios: string[];
  conversations: Conversation[];
}

const initialState: State = {
  user: null,
  messages: null,
  loading: false,
  kind: null,
  notificatios: [],
  conversations: null
};

export function userReducer(state = initialState, action: UserActions.UserActions) {
  // console.log("auth reducer " + action.type),
  switch (action.type) {
    case UserActions.FETCH_ALL_CONVERSATIONS:
    case UserActions.EMPLOYEE_APPLY_SAVE_POSITION_ATTEMPT:
    case UserActions.COMPANY_ACCEPT_REJECT_POSITION_ATTEMPT:
      return {
        ...state,
        messages: null,
        loading: true,
      };
    case UserActions.SET_CHAT_NOTIFICATION:
      const setNewNotifications = [...state.notificatios];
      if (setNewNotifications.findIndex(val => val === 'chat') === -1 ) {
        setNewNotifications.push('chat');
      }
      return {
        ...state,
        loading: true,
        notificatios: [...setNewNotifications]
      };
    case UserActions.REMOVE_CHAT_NOTIFICATION:
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
    case UserActions.SET_ALL_CONVERSATIONS:
      return {
        ...state,
        loading: false,
        conversations: action.payload
      };
    case UserActions.SET_SINGLE_CONVERSATION:
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
    case UserActions.COMPANY_CREATED_POSITION: // ONLY FOR A COMPANY - ON CREATE POSITION
      const updatedPositions: Position[] = [ ...(state.user as Company).positions, action.payload ];
      const updatedUser = {
        ...(state.user as Company),
        positions: updatedPositions
      };
      return {
        ...state,
        messages: null,
        user: updatedUser,
      };
    case UserActions.COMPANY_UPDATED_POSITION: // ONLY FOR A COMPANY - ON UPDATE POSITION
      const positions = [ ...(state.user as Company).positions ];
      const posInd = (state.user as Company).positions.findIndex(pos => pos._id === action.payload._id);
      positions[posInd] = { ...positions[posInd], ...action.payload };
      const upToDateUser: Company = {
        ...(state.user as Company),
        positions
      };
      return {
        ...state,
        messages: null,
        user: upToDateUser,
      };
    case UserActions.USER_FAILURE:
        return {
          ...state,
          loading: false,
          messages: action.payload,
        };
    case UserActions.UPDATE_ACTIVE_USER:
      return {
        ...state,
        loading: false,
        messages: null,
        kind: action.payload.kind,
        user: action.payload.kind === 'employee' ? action.payload.user as Employee : action.payload.user as Company
      };
    case UserActions.CLEAR_ERROR:
      return {
        ...state,
        loading: false,
        messages: null,
      };
    case UserActions.LOGOUT:
      return {
        ...state,
        loading: false,
        messages: null,
        user: null,
        kind: null,
        notificatios: [],
        conversations: null
      };
    default:
      return state;
  }
}
