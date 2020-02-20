import { Position } from 'app/position/position.model';




export class Employee {
  public _id: string; // the underscore is because the database named it like that
  public email: string;
  public positions: Position[];
  public firstName?: string;
  public lastName?: string;

  constructor(init?: Partial<Employee>) {
    Object.assign(this, init);
  }

}
