import { Employee } from 'app/employees/employee.model';


import * as UserActions from './user.actions';
import { Company } from 'app/company/company.model';
import { Conversation } from 'app/chat/conversation.model';



export interface State {
  user: Employee | Company;
  messages: any[];
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
    case UserActions.ADD_POSITION_TO_USER:
      const updatedPositions = [ ...state.user.positions, action.payload ];
      const updatedUser = {
        ...state.user,
        messages: null,
        positions: updatedPositions
      };
      return {
        ...state,
        user: updatedUser,
      };
    case UserActions.UPDATE_POSITION_OF_USER:
      const positions = [...state.user.positions];
      const posInd = state.user.positions.findIndex(pos => pos._id === action.payload._id);
      positions[posInd] = action.payload;
      const upToDateUser = {
        ...state.user,
        messages: null,
        positions
      };
      return {
        ...state,
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
        user: action.payload.user
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
