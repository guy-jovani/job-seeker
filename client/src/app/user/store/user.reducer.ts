import { Employee } from 'app/employees/employee.model';


import * as UserActions from './user.actions';
import { Company } from 'app/company/company.model';
import { Conversation } from 'app/chat/conversation.model';
import { Job } from 'app/job/job.model';



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
  conversations: [],
  lastFetchConversations: null
};

const getNewMessagesOfConversation = (stringMessage, fileMessage) => {
  const conMsgs = [];

  if (stringMessage) {
    conMsgs.push({...stringMessage});
  }
  if (fileMessage) {
    conMsgs.push({...fileMessage});
  }
  return conMsgs;
};

const setTimeOfNewMessagesOfConversation = (lastMsgDate, messages) => {
  messages.forEach(msg => {
    msg.createdAt = new Date(msg.createdAt); // will used the Date object methods
  });

  if ( lastMsgDate ) { // there are older messages
    const sameDayMsgs = lastMsgDate.toDateString() === messages[0].createdAt.toDateString();
    messages[0]['first'] = sameDayMsgs ? null : messages[0].createdAt.toDateString();
  } else { // no older messages
    messages[0]['first'] = messages[0].createdAt.toDateString();
  }
  messages.forEach(msg => {
    msg['hours'] = messages[0].createdAt.getHours().toString().padStart(2, '0');
    msg['minutes'] = messages[0].createdAt.getMinutes().toString().padStart(2, '0');
  });
};


export function userReducer(state = initialState, action: UserActions.UserActions) {
  // console.log("user reducer " + action.type)
  switch (action.type) {
    case UserActions.FETCH_ALL_CONVERSATIONS:
    case UserActions.EMPLOYEE_APPLY_SAVE_JOB_ATTEMPT:
    case UserActions.COMPANY_ACCEPT_REJECT_JOB_ATTEMPT:
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
      const conMsgs = getNewMessagesOfConversation(action.payload.stringMessage, action.payload.fileMessage);

      const newConId = action.payload.conversation._id;
      const oldConInd = state.conversations ? state.conversations.findIndex(con => con._id === newConId) : -1;
      const oldCon = oldConInd !== -1 ? state.conversations[oldConInd] : null;
      const lastMsgDate = !oldCon ? null :
                    new Date(oldCon.messages[oldCon.messages.length - 1].createdAt); // the msgs are sorted
      setTimeOfNewMessagesOfConversation(lastMsgDate, conMsgs);
      let updatedCon: Conversation, updatedCons: Conversation[];
      if (!oldCon) { // a new conversation
        updatedCon = { ...action.payload.conversation };
        updatedCon.messages = conMsgs;
        const userInd = updatedCon.participants.findIndex(participant =>
                  participant.user._id === state.user._id);
        if (userInd !== -1) {
          const newParticipants = [ ...updatedCon.participants ];
          newParticipants.splice(userInd, 1); // removing curr user
          updatedCon.participants = newParticipants;
        }
        updatedCons = [ ...state.conversations ];
        updatedCons.push(updatedCon);
      } else { // added message to an existing conversation
        updatedCon = { ...oldCon };
        const newMessages = [ ...oldCon.messages ];
        newMessages.push(...conMsgs);
        updatedCon.messages = newMessages;
        updatedCons = [ ...state.conversations ];
        updatedCons[oldConInd] = updatedCon;
      }
      return {
        ...state,
        loading: false,
        conversations: updatedCons
      };
    case UserActions.COMPANY_CREATED_JOB: // ONLY FOR A COMPANY - ON CREATE JOB
      const updatedJobs: Job[] = [ ...(state.user as Company).jobs, action.payload ];
      const updatedUser = {
        ...(state.user as Company),
        jobs: updatedJobs
      };
      return {
        ...state,
        messages: null,
        user: updatedUser,
      };
    case UserActions.COMPANY_UPDATED_JOB: // ONLY FOR A COMPANY - ON UPDATE JOB
      const jobs = [ ...(state.user as Company).jobs ];
      const jobInd = (state.user as Company).jobs.findIndex(job => job._id === action.payload._id);
      jobs[jobInd] = { ...jobs[jobInd], ...action.payload };
      const upToDateUser: Company = {
        ...(state.user as Company),
        jobs
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
        conversations: [],
        lastFetchConversations: null,
      };
    default:
      return state;
  }
}
