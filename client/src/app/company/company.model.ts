import { Employee } from 'app/employees/employee.model';







export class Company {
  public _id: string;
  public name: string;
  public email: string;
  public description: string;
  public website: string;
  public imagePath: string;
  public token?: string;

  constructor(init?: Partial<Company>){
    Object.assign(this, init);
  }


}







