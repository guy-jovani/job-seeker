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
  notifications: string[];
  conversations: Conversation[];
  lastFetchConversations: Date;
}

const initialState: State = {
  user: null,
  messages: null,
  loading: false,
  kind: null,
  notifications: [],
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
    msg['time'] = messages[0].createdAt.getHours().toString().padStart(2, '0') + ':' +
                    messages[0].createdAt.getMinutes().toString().padStart(2, '0');
  });
};



const sortConByLastMsgDate = (a: Conversation, b: Conversation) => {
  if (a.messages[a.messages.length - 1].createdAt < b.messages[b.messages.length - 1].createdAt) {
    return 1;
  }
  return -1;
};


export function userReducer(state = initialState, action: UserActions.UserActions) {
  // console.log("user reducer " + action.type)
  switch (action.type) {
    case UserActions.FETCH_ALL_CONVERSATIONS:
    case UserActions.UPDATE_WORK_EMPLOYEE_IN_DB:
    case UserActions.CREATE_WORK_EMPLOYEE_IN_DB:
    case UserActions.DELETE_WORK_EMPLOYEE_IN_DB:
    case UserActions.EMPLOYEE_APPLY_SAVE_JOB_ATTEMPT:
    case UserActions.COMPANY_ACCEPT_REJECT_JOB_ATTEMPT:
    case UserActions.UPDATE_SINGLE_EMPLOYEE_IN_DB:
    case UserActions.UPDATE_SINGLE_COMPANY_IN_DB:
    case UserActions.COMPANY_CREATE_JOB_IN_DB:
    case UserActions.CHANGE_USER_PASSWORD:
      return {
        ...state,
        loading: true,
      };
    case UserActions.SET_CHAT_NOTIFICATION:
      const setNewNotifications = [...state.notifications];
      if (setNewNotifications.findIndex(val => val === 'chat') === -1 ) {
        setNewNotifications.push('chat');
      }
      return {
        ...state,
        loading: true,
        notifications: [...setNewNotifications]
      };
    case UserActions.REMOVE_CHAT_NOTIFICATION:
      const newNotifications = [...state.notifications];
      const chatNotInd = newNotifications.findIndex(notification => notification === 'chat');
      if (chatNotInd !== -1) {
        newNotifications.splice(chatNotInd, 1);
      }
      return {
        ...state,
        loading: false,
        notifications: newNotifications
      };
    case UserActions.SET_ALL_CONVERSATIONS:
      const conversations = [...action.payload];
      conversations.sort(sortConByLastMsgDate);
      return {
        ...state,
        loading: false,
        lastFetchConversations: new Date(),
        conversations
      };
    case UserActions.SET_SINGLE_CONVERSATION:
      const conMsgs = getNewMessagesOfConversation(action.payload.stringMessage, action.payload.fileMessage);

      const newConId = action.payload.conversation._id;
      const oldConInd = state.conversations ? state.conversations.findIndex(con => con._id === newConId) : -1;
      const oldCon = oldConInd !== -1 ? state.conversations[oldConInd] : null;
      const lastMsgDate = !oldCon ? null :
                    new Date(oldCon.messages[oldCon.messages.length - 1].createdAt); // the messages are sorted

      if (conMsgs.length) {
        setTimeOfNewMessagesOfConversation(lastMsgDate, conMsgs);
      }
      let updatedCon: Conversation;
      const updatedCons = [ ...state.conversations ];
      if (!oldCon) { // a new conversation
        updatedCon = { ...action.payload.conversation };
        updatedCon.messages = conMsgs;
        updatedCons.push(updatedCon);
      } else { // added message to an existing conversation || user read a conversation
        updatedCon = { ...action.payload.conversation };
        const newMessages = [ ...oldCon.messages ];
        newMessages.push(...conMsgs);
        updatedCon.messages = newMessages;
        // updatedCon.participants = [...action.payload.conversation.participants];
        updatedCons[oldConInd] = updatedCon;
      }
      updatedCons.sort(sortConByLastMsgDate);
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
      const jobs: Job[] = [ ...(state.user as Company).jobs ];
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
      const user = action.payload.kind === 'employee' ?
                { ...action.payload.user as Employee } :
                { ...action.payload.user as Company };

      if (action.payload.kind === 'employee') {
        user['work'] = user['work'].map(work => {
          const newWork = { ...work };
          newWork.startDate = new Date(newWork.startDate);
          newWork.endDate = newWork.endDate ? new Date(newWork.endDate) : newWork.endDate;
          return newWork;
        });
      } else {
        user['applicants'] =
          user['applicants'].map(applicant => {
            const newApplicant = { ...applicant };
            newApplicant['employee'] = { ...newApplicant['employee'] };
            newApplicant['employee']['work'] = newApplicant['employee']['work'].map(work => {
              const newWork = { ...work };
              newWork.startDate = new Date(newWork.startDate);
              newWork.endDate = newWork.endDate ? new Date(newWork.endDate) : newWork.endDate;
              return newWork;
            });
            return newApplicant;
        });
      }

      return {
        ...state,
        loading: false,
        messages: null,
        kind: action.payload.kind,
        user
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
        notifications: [],
        conversations: [],
        lastFetchConversations: null,
      };
    default:
      return state;
  }
}
