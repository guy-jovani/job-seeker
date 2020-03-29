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
  lastFetchConversations: Date;
}

const initialState: State = {
  user: null,
  messages: null,
  loading: false,
  kind: null,
  notificatios: [],
  conversations: null,
  lastFetchConversations: null
};

export function userReducer(state = initialState, action: UserActions.UserActions) {
  // console.log("user reducer " + action.type)
  switch (action.type) {
    case UserActions.FETCH_ALL_CONVERSATIONS:
    case UserActions.EMPLOYEE_APPLY_SAVE_POSITION_ATTEMPT:
    case UserActions.COMPANY_ACCEPT_REJECT_POSITION_ATTEMPT:
      return {
        ...state,
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
        loading: false,
        notificatios: newNotifications
      };
    case UserActions.SET_ALL_CONVERSATIONS:
      return {
        ...state,
        loading: false,
        lastFetchConversations: new Date(),
        conversations: action.payload
      };
    case UserActions.SET_SINGLE_CONVERSATION:
      const newConId = action.payload.conversation._id;

      const oldConId = state.conversations ? state.conversations.findIndex(con => con._id === newConId) : -1;
      const updatedCons = state.conversations ? [...state.conversations] : [];
      const conMsgs = [];
      if (action.payload.stringMessage) {
        conMsgs.push(action.payload.stringMessage);
      }
      if (action.payload.fileMessage) {
        conMsgs.push(action.payload.fileMessage);
      }
      if (oldConId === -1) { // a new conversation
        action.payload.conversation.messages = conMsgs;
        updatedCons.push(action.payload.conversation);
      } else { // added message to an existing conversation
        conMsgs.forEach(msg => {
          msg.createdAt = new Date(msg.createdAt); // will used the Date object methods
        });
        const oldMessagesLength = updatedCons[oldConId].messages.length;
        if ( oldMessagesLength ) {
          const lastMsgDate = new Date(updatedCons[oldConId].messages[oldMessagesLength - 1].createdAt);
          conMsgs[0]['first'] =
                lastMsgDate.toDateString() === conMsgs[0].createdAt.toDateString() ?
                null : conMsgs[0].createdAt.toDateString() ;
        } else { // no older messages
          conMsgs[0]['first'] = conMsgs[0].createdAt.toDateString();
        }
        conMsgs.forEach(msg => {
          msg['hours'] = conMsgs[0].createdAt.getHours().toString().padStart(2, '0');
          msg['minutes'] = conMsgs[0].createdAt.getMinutes().toString().padStart(2, '0');
        });
        updatedCons[oldConId].messages.push(...conMsgs);
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
        conversations: null,
        lastFetchConversations: null,
      };
    default:
      return state;
  }
}
