

import * as CompanyActions from './company.actions';
import { Company } from '../company.model';



export interface State {
  companies: Company[];
  messages: any[];
  loadingAll: boolean;
  loadingSingle: boolean;
  lastFetch: Date;
  page: number;
  total: number;
  searchQuery: { name?: string, job?: string, published: string };
}

const initialState: State = {
  companies: [],
  messages: null,
  loadingAll: false,
  loadingSingle: false,
  lastFetch: null,
  page: 1,
  total: null,
  searchQuery: { published: 'all' }
};

export function companyReducer(state = initialState, action: CompanyActions.CompanyActions) {
  switch (action.type) {
    case CompanyActions.SET_COMPANIES:
      const setPage = action.payload.companies.length ? state.page + 1  : state.page;

      return {
        ...state,
        companies: [...state.companies, ...action.payload.companies],
        loadingAll: false,
        messages: null,
        page: setPage,
        total: action.payload.total,
        lastFetch: new Date()
      };
    case CompanyActions.COMPANY_OP_FAILURE:
      return {
        ...state,
        messages: action.payload,
        loadingAll: false,
        loadingSingle: false
      };
    case CompanyActions.COMPANY_STATE_LOAD_SINGLE:
    case CompanyActions.FETCH_SINGLE_COMPANY:
      return {
        ...state,
        loadingSingle: true
      };
    case CompanyActions.FETCH_COMPANIES:
      const searchQuery = { ...state.searchQuery };
      let companies = [ ...state.companies ];
      let fetchPage = state.page;

      if (action.payload) {
        companies = action.payload.search.name !== searchQuery.name ? [] : companies;
        fetchPage = action.payload.search.name !== searchQuery.name ? 1 : fetchPage;
        searchQuery['name'] = action.payload.search.name;

        companies = action.payload.search.job !== searchQuery.job ? [] : companies;
        fetchPage = action.payload.search.job !== searchQuery.job ? 1 : fetchPage;
        searchQuery['job'] = action.payload.search.job;

        companies = action.payload.search.published !== searchQuery.published ? [] : companies;
        fetchPage = action.payload.search.published !== searchQuery.published ? 1 : fetchPage;
        searchQuery['published'] = action.payload.search.published;
      }

      return {
        ...state,
        searchQuery,
        companies,
        page: fetchPage,
        loadingAll: true,
      };
    case CompanyActions.SET_SEARCH_QUERY_COMPANY:
      return {
        ...state,
        searchQuery: action.search
      };
    case CompanyActions.SET_SINGLE_COMPANY:
      const index = state.companies.findIndex(comp => comp._id === action.payload.company._id );
      const updatedCompanies = [ ...state.companies ];
      const updatedCompany = {
        ...action.payload.company
      };
      updatedCompanies[index] = updatedCompany;
      return {
        ...state,
        companies: [ ...updatedCompanies ],
        messages: null,
        loadingSingle: false
      };
    case CompanyActions.CLEAR_ERROR:
      return {
        ...state,
        messages: null,
        loadingAll: false,
        loadingSingle: false
      };
    case CompanyActions.LOGOUT:
      return {
        ...state,
        messages: null,
        companies: [],
        loadingAll: false,
        loadingSingle: false,
        tempCompany: null,
        lastFetch: null,
        page: 1,
        total: null,
        searchQuery: { published: 'all' }
      };
    default:
      return state;
  }
}





















