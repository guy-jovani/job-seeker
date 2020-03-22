
import { Position } from 'app/position/position.model';
import { Employee } from 'app/employees/employee.model';


export interface ApplicantPosition {
  // _id: string; // has an id - but should never access it
  position: Position;
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
  public imagesPath?: string[] | File[];
  public positions?: Position[];
  public applicants: { employee: Employee, positions: ApplicantPosition[] }[];
  public lastFetch?: Date;

  constructor(init?: Partial<Company>) {
    Object.assign(this, init);
  }


}







