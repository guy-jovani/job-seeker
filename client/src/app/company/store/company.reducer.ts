

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
}

const initialState: State = {
  companies: [],
  messages: null,
  loadingAll: false,
  loadingSingle: false,
  lastFetch: null,
  page: 1,
  total: null
};

export function companyReducer(state = initialState, action: CompanyActions.CompanyActions) {
  switch (action.type) {
    case CompanyActions.SET_COMPANIES:
      return {
        ...state,
        companies: [...state.companies, ...action.payload.companies],
        loadingAll: false,
        messages: null,
        page: state.page + 1,
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
    case CompanyActions.UPDATE_SINGLE_COMPANY_IN_DB:
    case CompanyActions.COMPANY_STATE_LOAD_SINGLE:
    case CompanyActions.FETCH_SINGLE_COMPANY:
    case CompanyActions.UPDATE_SINGLE_COMPANY_POSITION_ATTEMPT:
      return {
        ...state,
        loadingSingle: true
      };
    case CompanyActions.FETCH_COMPANIES:
      return {
        ...state,
        loadingAll: true,
      };
    case CompanyActions.UPDATE_SINGLE_COMPANY:
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
    case CompanyActions.UPDATE_SINGLE_COMPANY_POSITION:
      const compInd = state.companies.findIndex(comp => comp._id === action.payload.company._id );
      action.payload.lastFetch = new Date();
      const positions = [...state.companies[compInd].positions];
      const posInd = state.companies[compInd].positions.findIndex(pos =>
                                pos._id === action.payload._id );
      positions[posInd] = action.payload;

      const upToDateCompanies = [ ...state.companies ];
      const upToDateCompany = {
        ...upToDateCompanies[compInd],
        positions
      };
      upToDateCompanies[compInd] = upToDateCompany;
      return {
        ...state,
        messages: null,
        companies: [ ...upToDateCompanies ],
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
        total: null
      };
    default:
      return state;
  }
}





















