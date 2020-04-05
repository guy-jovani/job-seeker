
import { ActionReducerMap } from '@ngrx/store';

import * as fromAuth from '../auth/store/auth.reducer';
import * as fromEmployee from '../employees/store/employee.reducer';
import * as fromCompany from '../company/store/company.reducer';
import * as fromJob from '../job/store/job.reducer';
import * as fromUser from '../user/store/user.reducer';


export interface AppState {
  auth: fromAuth.State;
  employee: fromEmployee.State;
  company: fromCompany.State;
  job: fromJob.State;
  user: fromUser.State;
}

export const appReducer: ActionReducerMap<AppState> = {
  auth: fromAuth.authReducer,
  employee: fromEmployee.employeeReducer,
  company: fromCompany.companyReducer,
  job: fromJob.jobReducer,
  user: fromUser.userReducer,
};





