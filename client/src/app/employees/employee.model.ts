import { Job } from 'app/job/job.model';


export enum EmployeeJobStatus {
  'saved', 'applied', 'rejected', 'accepted'
}

export class Work {
  _id?: string;
  title: string;
  company: string;
  startDate: Date;
  endDate: Date;
  employmentType?: string;

  constructor(init?: Partial<Work>) {
    Object.assign(this, init);
  }
}

export class Employee {
  // tslint:disable-next-line: variable-name
  public _id: string; // the underscore is because the database named it like that
  public email: string;
  public profileImagePath?: string | File;
  public jobs?: {
    job: Job,
    status: EmployeeJobStatus,
    date: Date
  }[];
  public firstName?: string;
  public lastName?: string;
  public work: Work[];

  constructor(init?: Partial<Employee>) {
    Object.assign(this, init);
  }

}
