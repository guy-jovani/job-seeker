import { Injectable } from '@angular/core';

import * as UserActions from './store/user.actions';
import { Company } from 'app/company/company.model';
import { Employee, Work } from 'app/employees/employee.model';
import { Job } from 'app/job/job.model';

@Injectable({
  providedIn: 'root'
})
export class UserStorageService {

  setUserStorage = (user: Company | Employee, kind: string) => {
    const storedUser = JSON.parse(localStorage.getItem('userData'));

    localStorage.setItem('userData', JSON.stringify({ ...storedUser, ...user }));
    localStorage.setItem('kind', JSON.stringify(kind));
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

  createdUpdateUserCompanyStorage = (job: Job, type: string) => {
    const [user] = this.getUserAndTokensStorage();
    if (type === UserActions.COMPANY_CREATED_JOB) {
      user.jobs.push(job);
    } else { // updated
      const index = user.jobs.findIndex(tempJob => tempJob._id === job._id);
      user.jobs[index] = job;
    }
    this.setUserStorage(user, 'company');
  }

  CRUDEmployeeWorkStorage = (crudWork: Work, type: string) => {
    const [user] = this.getUserAndTokensStorage();
    const index = user.work.findIndex((work: Work) => work._id === crudWork._id);
    if (type === UserActions.UPDATED_WORK_EMPLOYEE) {
      user.work[index] = crudWork;
    } else if (type === UserActions.CREATED_WORK_EMPLOYEE) {
      user.work.push(crudWork);
    } else { // deleted
      user.jobs.splice(index, 1);
    }

    this.setUserStorage(user, 'employee');
  }
}
