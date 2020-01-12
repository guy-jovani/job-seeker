import { Employee } from 'app/employees/employee.model';







export class Company {
  public _id: string;
  public name: string;
  public description: string;
  public creatorId: string;
  public website: string;
  public image: string;

  constructor(init?:Partial<Company>){
    Object.assign(this, init);
  }
  

}







