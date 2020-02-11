



export class Employee {
  public _id: string; // the underscore is because the database named it like that
  public email: string;
  public token?: string;
  public firstName?: string;
  public lastName?: string;

  constructor(init?: Partial<Employee>) {
    Object.assign(this, init);
  }

}
