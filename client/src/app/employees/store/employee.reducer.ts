
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
}

const initialState: State = {
  employees: [],
  messages: null,
  loadingAll: false,
  loadingSingle: false,
  lastFetch: null,
  page: 1,
  total: null
};

export function employeeReducer(state = initialState, action: EmployeeActions.EmployeeActions) {
  switch (action.type) {
    case EmployeeActions.SET_EMPLOYEES:
      return {
        ...state,
        employees: [ ...state.employees, ...action.payload.employees ],
        messages: null,
        loadingAll: false,
        page: state.page + 1,
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
    case EmployeeActions.FETCH_EMPLOYEES:
      return {
        ...state,
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
      };
    default:
      return state;
  }
}





















