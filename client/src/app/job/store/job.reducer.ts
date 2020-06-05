



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
  searchQuery: { title?: string, company?: string, published: string };
}

const initialState: State = {
  jobs: [],
  messages: [],
  loadingAll: false,
  loadingSingle: false,
  lastFetch: null,
  page: 1,
  total: null,
  searchQuery: { published: 'all' }
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
      const searchQuery = { ...state.searchQuery };
      let jobs = [ ...state.jobs ];
      let fetchPage = state.page;
      if (action.payload) {
        jobs = action.payload.search.title !== searchQuery.title ? [] : jobs;
        fetchPage = action.payload.search.title !== searchQuery.title ? 1 : fetchPage;
        searchQuery['title'] = action.payload.search.title;

        jobs = action.payload.search.company !== searchQuery.company ? [] : jobs;
        fetchPage = action.payload.search.company !== searchQuery.company ? 1 : fetchPage;
        searchQuery['company'] = action.payload.search.company;

        jobs = action.payload.search.published !== searchQuery.published ? [] : jobs;
        fetchPage = action.payload.search.published !== searchQuery.published ? 1 : fetchPage;
        searchQuery['published'] = action.payload.search.published;
      }
      return {
        ...state,
        searchQuery,
        jobs,
        page: fetchPage,
        loadingAll: true,
      };
    case JobActions.FETCH_SINGLE_JOB:
    case JobActions.UPDATE_SINGLE_JOB_COMPANY_ATTEMPT:
      return {
        ...state,
        loadingSingle: true
      };
    case JobActions.SET_SEARCH_QUERY_JOB:
      return {
        ...state,
        searchQuery: action.search
      };
    case JobActions.CLEAR_ERROR:
      return {
        ...state,
        loadingSingle: false,
        messages: [],
        loadingAll: false,
      };
    case JobActions.LOGOUT:
      return {
        ...state,
        loadingSingle: false,
        messages: [],
        loadingAll: false,
        jobs: [],
        page: 1,
        total: null,
        tempJob: null,
        lastFetch: null,
        searchQuery: { published: 'all' }
      };
    case JobActions.SET_JOBS:
      const setPage = action.payload.jobs.length ? state.page + 1  : state.page;

      return {
        ...state,
        page: setPage,
        total: action.payload.total,
        jobs: [ ...state.jobs, ...action.payload.jobs ],
        loadingAll: false,
        messages: [],
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
        messages: [],
        loadingSingle: false,
        jobs: upToDateJobs
      };
    case JobActions.SET_SINGLE_JOB:
      const jobInd = state.jobs.findIndex(job => job._id === action.payload.job._id);
      const updatedJobs = [...state.jobs];
      const updatedJob = {
          ...action.payload.job
        };
      if (jobInd > -1) {
        updatedJobs[jobInd] = updatedJob;
      } else {
        updatedJobs.push(updatedJob);
      }
      return {
        ...state,
        messages: [],
        jobs: [ ...updatedJobs],
        loadingAll: false,
        loadingSingle: false,
      };
    default:
      return state;
  }
}























