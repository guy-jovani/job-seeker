



import { Job } from '../job.model';
import * as JobActions from './job.actions';



export interface State {
  jobs: Job[];
  loadingAll: boolean;
  loadingSingle: boolean;
  messages: any[];
  lastFetch: Date;
  page: number;
  total: number;
}

const initialState: State = {
  jobs: [],
  messages: null,
  loadingAll: false,
  loadingSingle: false,
  lastFetch: null,
  page: 1,
  total: null
};

export function jobReducer(state = initialState, action: JobActions.JobActions) {
  switch (action.type) {
    case JobActions.JOB_STATE_LOAD_SINGLE:
      return {
        ...state,
        loadingAll: false,
        loadingSingle: true,
      };
    case JobActions.FETCH_JOBS:
      return {
        ...state,
        loadingAll: true,
      };
    // case JobActions.FETCH_SINGLE_JOB:
    case JobActions.UPDATE_SINGLE_JOB_COMPANY_ATTEMPT:
      return {
        ...state,
        loadingSingle: true
      };
    case JobActions.CLEAR_ERROR:
      return {
        ...state,
        loadingSingle: false,
        messages: null,
        loadingAll: false,
      };
    case JobActions.LOGOUT:
      return {
        ...state,
        loadingSingle: false,
        messages: null,
        loadingAll: false,
        jobs: [],
        page: 1,
        total: null,
        tempJob: null,
        lastFetch: null
      };
    case JobActions.SET_JOBS:
      return {
        ...state,
        page: state.page + 1,
        total: action.payload.total,
        jobs: [ ...state.jobs, ...action.payload.jobs ],
        loadingAll: false,
        messages: null,
        lastFetch: new Date()
      };
    case JobActions.JOB_OP_FAILURE:
      return {
        ...state,
        messages: action.payload,
        loadingAll: false,
        loadingSingle: false,
      };
    case JobActions.UPDATE_SINGLE_JOB_COMPANY:
      const jobWithCompany = {
        ...state.jobs[action.payload.jobInd],
        company: { ...action.payload.company, lastFetch: new Date() }
      };
      const upToDateJobs = [ ...state.jobs ];
      upToDateJobs[action.payload.jobInd] = jobWithCompany;
      return {
        ...state,
        messages: null,
        loadingSingle: false,
        jobs: upToDateJobs
      };
    // case JobActions.ADD_UPDATE_SINGLE_JOB:
    //   const jobInd = state.jobs.findIndex(job => job._id === action.payload.job._id);
    //   const updatedJobs = [...state.jobs];
    //   const updatedJob = {
    //       ...action.payload.job
    //     };
    //   if (jobInd > -1) {
    //     updatedJobs[jobInd] = updatedJob;
    //   } else {
    //     updatedJobs.push(updatedJob);
    //   }
    //   return {
    //     ...state,
    //     messages: null,
    //     jobs: [ ...updatedJobs],
    //     loadingAll: false,
    //     loadingSingle: false,
    //   };
    default:
      return state;
  }
}























