
import { ActionReducerMap } from '@ngrx/store';

import * as fromAuth from '../auth/store/auth.reducer';
import * as fromEmployee from '../employees/store/employee.reducer';
import * as fromCompany from '../company/store/company.reducer';
import * as fromPosition from '../position/store/position.reducer';


export interface AppState {
  auth: fromAuth.State;
  employee: fromEmployee.State;
  company: fromCompany.State;
  position: fromPosition.State;
}

export const appReducer: ActionReducerMap<AppState> = {
  auth: fromAuth.authReducer,
  employee: fromEmployee.employeeReducer,
  company: fromCompany.companyReducer,
  position: fromPosition.positionReducer,
};

















