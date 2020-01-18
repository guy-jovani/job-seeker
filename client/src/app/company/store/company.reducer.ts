

import * as CompanyActions from './company.actions';
import { Company } from '../company.model';





export interface State {
  companies: Company[];
  messages: any[]; 
  loadingAll: boolean; 
  loadingSingle: boolean; 
}

const initialState: State = {
  companies: [],
  messages: null,
  loadingAll: false,
  loadingSingle: false,
}

export function companyReducer(state = initialState, action: CompanyActions.CompanyActions){
  switch(action.type){
    case CompanyActions.SET_ALL_COMPANIES:
      return {
        ...state, 
        companies: [...action.payload],
        messages: null,
        loadingAll: false,
        loadingSingle: false
      };
    case CompanyActions.COMPANY_OP_FAILURE:
      return {
        ...state,
        messages: action.payload,
        loadingAll: false,
        loadingSingle: false
      }
    case CompanyActions.UPDATE_SINGLE_COMPANY_IN_DB:
    case CompanyActions.FETCH_SINGLE_COMPANY:
      return {
        ...state,
        loadingSingle: true,
      }
    case CompanyActions.FETCH_ALL_COMPANIES:
      return {
        ...state,
        loadingAll: true,
      }
    case CompanyActions.UPDATE_SINGLE_COMPANY:
      const index = state.companies.findIndex(comp => comp._id === action.payload.company._id );
      const updatedCompanies = [ ...state.companies ]
      const updatedCompany = { 
        ...action.payload.company
      }
      updatedCompanies[index] = updatedCompany;
      return {
        ...state,
        companies: [ ...updatedCompanies ],
        messages: null,
        loadingAll: false,
        loadingSingle: false
      }
    case CompanyActions.CLEAR_ERROR:
      return {
        ...state,
        messages: null,
        loadingAll: false,
        loadingSingle: false
      }
    case CompanyActions.LOGOUT:
      return {
        ...state,
        messages: null,
        companies: [],
        loadingAll: false,
        loadingSingle: false
      }
    default:
      return state;
  }
}

    // case CompanyActions.SET_SINGLE_COMPANY:
    //   return {
    //     ...state,
    //     companies: [ ...state.companies, action.payload.company ],
    //     messages: null
    //   }



















