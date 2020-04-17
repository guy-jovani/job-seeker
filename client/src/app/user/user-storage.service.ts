import { Injectable } from '@angular/core';

import * as UserActions from './store/user.actions';
import { Company } from 'app/company/company.model';
import { Employee } from 'app/employees/employee.model';

@Injectable({
  providedIn: 'root'
})
export class UserStorageService {

  setUserStorage = (user: Company | Employee, kind: string = null) => {
    localStorage.setItem('userData', JSON.stringify({ ...user }));
    if (kind) {
      localStorage.setItem('kind', JSON.stringify(kind));
    }
  }

  getUserAndTokensStorage = () => {
    const user = JSON.parse(localStorage.getItem('userData'));
    const kind = JSON.parse(localStorage.getItem('kind'));
    const token = JSON.parse(localStorage.getItem('token'));
    const refreshToken = JSON.parse(localStorage.getItem('refreshToken'));
    const expirationDate = JSON.parse(localStorage.getItem('expirationDate'));
    return [user, kind, token, expirationDate, refreshToken];
  }

  removeUserAndTokensStorage = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('kind');
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
    localStorage.removeItem('refreshToken');
  }

  updateUserJobsStorage = (job, type) => {
    const [user] = this.getUserAndTokensStorage();
    if (type === UserActions.COMPANY_CREATED_JOB) {
      user.jobs.push(job);
    } else {
      const index = user.jobs.findIndex(tempJob => tempJob._id === job._id);
      user.jobs[index] = job;
    }
    this.setUserStorage(user);
  }
}
