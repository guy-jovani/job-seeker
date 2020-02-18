
import { Employee } from '../employee.model';
import * as EmployeeActions from './employee.actions';




export interface State {
  employees: Employee[];
  loadingAll: boolean;
  loadingSingle: boolean;
  messages: any[];
}

const initialState: State = {
  employees: [],
  messages: null,
  loadingAll: false,
  loadingSingle: false,
};

export function employeeReducer(state = initialState, action: EmployeeActions.EmployeeActions) {
  // console.log("employee reducer " + action.type);
  switch (action.type) {
    case EmployeeActions.SET_ALL_EMPLOYEES:
      return {
        ...state,
        employees: [...action.payload],
        messages: null,
        loadingAll: false,
        loadingSingle: false,
      };
    case EmployeeActions.EMPLOYEE_OP_FAILURE:
      return {
        ...state,
        messages: action.payload,
        loadingAll: false,
        loadingSingle: false
      };
    case EmployeeActions.UPDATE_SINGLE_EMPLOYEE_IN_DB:
    case EmployeeActions.FETCH_SINGLE_EMPLOYEE:
      return {
        ...state,
        loadingSingle: true,
      };
    case EmployeeActions.FETCH_ALL_EMPLOYEES:
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
    case EmployeeActions.UPDATE_SINGLE_EMPLOYEE:
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
        loadingSingle: false
      };
    default:
      return state;
          // case EmployeeActions.SET_ONE_EMPLOYEE:
          //   return {
          //     ...state,
          //     employees: [...state.employees, action.payload],
          //     messages: null
          //   };
          // case EmployeeActions.DELETE_EMPLOYEE:
          //   return {
          //     ...state,
          //     // employees: state.employees.filter((emp, index) =>
          //     //               emp['_id'] !== action.payload),
          //     messages: null
          //   };
          //   updatedEmployees[index] = updatedEmployee;
            // return {
            //   ...state,
            //   employees: [...updatedEmployees],
            //   messages: null
            // };
  }
}





















