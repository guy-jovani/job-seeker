import { Injectable } from '@angular/core';

import * as UserActions from './store/user.actions';
import { Company } from 'app/company/company.model';
import { Employee } from 'app/employees/employee.model';

@Injectable({
  providedIn: 'root'
})
export class UserSessionService {

  setUserSessionStorage = (user: Company | Employee, kind: string = null) => {
    sessionStorage.setItem('userData', JSON.stringify({ ...user }));
    if (kind) {
      sessionStorage.setItem('kind', JSON.stringify(kind));
    }
  }

  getUserAndTokensSessionStorage = () => {
    const user = JSON.parse(sessionStorage.getItem('userData'));
    const kind = JSON.parse(sessionStorage.getItem('kind'));
    const token = JSON.parse(sessionStorage.getItem('token'));
    const refreshToken = JSON.parse(sessionStorage.getItem('refreshToken'));
    const expirationDate = JSON.parse(sessionStorage.getItem('expirationDate'));
    return [user, kind, token, expirationDate, refreshToken];
  }

  removeUserAndTokensSessionStorage = () => {
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('kind');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('expirationDate');
    sessionStorage.removeItem('refreshToken');
  }

  updateUserJobsSessionStorage = (job, type) => {
    const [user] = this.getUserAndTokensSessionStorage();
    if (type === UserActions.CompanyCreatedJob) {
      user.jobs.push(job);
    } else {
      const index = user.jobs.findIndex(tempJob => tempJob._id === job._id);
      user.jobs[index] = job;
    }
    this.setUserSessionStorage(user);
  }
}
