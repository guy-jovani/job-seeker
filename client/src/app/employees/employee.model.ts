import { Position } from 'app/position/position.model';

export enum EmployeePositionStatus {
  'saved', 'applied', 'rejected', 'accepted'
}

export class Employee {
  // tslint:disable-next-line: variable-name
  public _id: string; // the underscore is because the database named it like that
  public email: string;
  public positions?: { // TODO problem since the company positions are different
    position: Position,
    status: EmployeePositionStatus,
    date: Date
  }[];
  public firstName?: string;
  public lastName?: string;

  constructor(init?: Partial<Employee>) {
    Object.assign(this, init);
  }

}
