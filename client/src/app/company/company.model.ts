
import { Job } from 'app/job/job.model';
import { Employee } from 'app/employees/employee.model';


export interface Applicant {
  employee: Employee;
  jobs: ApplicantJob[];
}

export interface ApplicantJob {
  // _id: string; // has an id - but should never access it
  job: Job;
  status: ApplicantStatus;
  date: Date;
}

export enum ApplicantStatus {
  'applied', 'rejected', 'accepted'
}


export class Company {
  // tslint:disable-next-line: variable-name
  public _id: string;
  public name: string;
  public email?: string;
  public description?: string;
  public website?: string;
  public profileImagePath?: File | string;
  public imagesPath?: string[] | File[];
  public jobs?: Job[];
  public applicants: Applicant[];
  public lastFetch?: Date;

  constructor(init?: Partial<Company>) {
    Object.assign(this, init);
  }


}







