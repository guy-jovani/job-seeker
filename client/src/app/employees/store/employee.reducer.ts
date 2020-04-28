
import { Employee } from '../employee.model';
import * as EmployeeActions from './employee.actions';




export interface State {
  employees: Employee[];
  loadingAll: boolean;
  loadingSingle: boolean;
  messages: any[];
  lastFetch: Date;
  page: number;
  total: number;
  searchQuery: { name?: string, company?: string, work?: string };
}

const initialState: State = {
  employees: [],
  messages: null,
  loadingAll: false,
  loadingSingle: false,
  lastFetch: null,
  page: 1,
  total: null,
  searchQuery: {}
};

export function employeeReducer(state = initialState, action: EmployeeActions.EmployeeActions) {
  switch (action.type) {
    case EmployeeActions.SET_EMPLOYEES:
      const setPage = action.payload.employees.length ? state.page + 1  : state.page;

      return {
        ...state,
        employees: [ ...state.employees, ...action.payload.employees ],
        messages: null,
        loadingAll: false,
        page: setPage,
        total: action.payload.total,
        loadingSingle: false,
        lastFetch: new Date()
      };
    case EmployeeActions.EMPLOYEE_OP_FAILURE:
      return {
        ...state,
        messages: action.payload,
        loadingAll: false,
        loadingSingle: false
      };
    case EmployeeActions.FETCH_SINGLE_EMPLOYEE:
      return {
        ...state,
        loadingSingle: true,
      };
    case EmployeeActions.SET_SEARCH_QUERY_EMPLOYEE:
      return {
        ...state,
        searchQuery: action.search
      };
    case EmployeeActions.FETCH_EMPLOYEES:
      const searchQuery = { ...state.searchQuery };
      let employees = [ ...state.employees ];
      let fetchPage = state.page;
      if (action.payload) {
        employees = action.payload.search.name !== searchQuery.name ? [] : employees;
        fetchPage = action.payload.search.name !== searchQuery.name ? 1 : fetchPage;
        searchQuery['name'] = action.payload.search.name;

        employees = action.payload.search.company !== searchQuery.company ? [] : employees;
        fetchPage = action.payload.search.company !== searchQuery.company ? 1 : fetchPage;
        searchQuery['company'] = action.payload.search.company;

        employees = action.payload.search.work !== searchQuery.work ? [] : employees;
        fetchPage = action.payload.search.work !== searchQuery.work ? 1 : fetchPage;
        searchQuery['work'] = action.payload.search.work;
      }

      return {
        ...state,
        searchQuery,
        employees,
        page: fetchPage,
        loadingAll: true,
      };
    case EmployeeActions.CLEAR_ERROR:
      return {
        ...state,
        messages: null,
        loadingAll: false,
        loadingSingle: false
      };
    case EmployeeActions.SET_SINGLE_EMPLOYEE:
      const index = state.employees.findIndex(emp => emp['_id'] === action.payload._id);
      const updatedEmployees = [...state.employees];
      const updatedEmployee = {
          ...action.payload
        };
      updatedEmployees[index] = updatedEmployee;
      return {
        ...state,
        employees: [...updatedEmployees],
        messages: null,
        loadingAll: false,
        loadingSingle: false
      };
    case EmployeeActions.LOGOUT:
      return {
        ...state,
        messages: null,
        employees: [],
        loadingAll: false,
        loadingSingle: false,
        lastFetch: null,
        page: 1,
        total: null,
        searchQuery: {}
      };
    default:
      return state;
  }
}





















