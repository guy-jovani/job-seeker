
import { Employee } from '../employee.model';
import * as EmployeeActions from './employee.actions';




export interface State {
  employees: Employee[];
  messages: any[]; 
}

const initialState: State = {
  employees: [],
  messages: null
}

export function employeeReducer(state = initialState, action: EmployeeActions.EmployeeActions){
  // console.log("employee reducer " + action.type);
  switch(action.type){
    case EmployeeActions.SET_ALL_EMPLOYEES:
      return {
        ...state, 
        employees: [...action.payload],
        messages: null
      };
    case EmployeeActions.EMPLOYEE_OP_FAILURE:
      return {
        ...state,
        messages: action.payload
      }
    case EmployeeActions.CLEAR_ERROR:
      return {
        ...state,
        messages: null
      }
    case EmployeeActions.UPDATE_SINGLE_EMPLOYEE:
      const index = state.employees.findIndex(emp => emp['_id'] === action.payload._id);
      const updatedEmployees = [...state.employees];
      const updatedEmployee = 
        {
          // ...state.employees[index],
          ...action.payload
        };
      updatedEmployees[index] = updatedEmployee; 
      return {
        ...state, 
        employees: [...updatedEmployees],
        messages: null
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





















