

import * as CompanyActions from './company.actions';
import { Company } from '../company.model';





export interface State {
  companies: Company[];
  messages: any[]; 
}

const initialState: State = {
  companies: [],
  messages: null
}

export function companyReducer(state = initialState, action: CompanyActions.CompanyActions){
  switch(action.type){
    case CompanyActions.SET_ALL_COMPANIES:
      return {
        ...state, 
        companies: [...action.payload],
        messages: null
      };
    case CompanyActions.COMPANY_OP_FAILURE:
      return {
        ...state,
        messages: action.payload
      }
    // case CompanyActions.SET_SINGLE_COMPANY:
    //   return {
    //     ...state,
    //     companies: [ ...state.companies, action.payload.company ],
    //     messages: null
    //   }
    case CompanyActions.UPDATE_SINGLE_COMPANY:
      const index = state.companies.findIndex(comp => comp._id === action.payload.company._id );
      const updatedCompanies = [ ...state.companies ]
      const updatedCompany = { 
        // ...state.companies[index],
        ...action.payload.company
      }
      updatedCompanies[index] = updatedCompany;
      return {
        ...state,
        companies: [ ...updatedCompanies ],
        messages: null
      }
    case CompanyActions.CLEAR_ERROR:
      return {
        ...state,
        messages: null
      }
    default:
      return state;
  }
}





















