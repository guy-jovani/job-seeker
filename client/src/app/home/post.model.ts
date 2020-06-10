import { Employee } from 'app/employees/employee.model';
import { Company } from 'app/company/company.model';


class Comment {
  author: Employee | Company;
  content: string;
  onModel: 'Employee' | 'Company';
  createdAt: Date;
  updatedAt: Date;
}


export class Post {
  public _id: string;
  public content: string;
  public author: Employee | Company;
  public createdAt: Date;
  public updatedAt: Date;
  public allowComments: boolean;
  public comments: {
    total: number,
    page: number,
    comments: Comment[]
  };
  public likes: {
    total: number,
    users: {
      user: Employee | Company,
      onModel: 'Employee' | 'Company'
    }[]
  };
  public onModel: 'Employee' | 'Company';

  constructor(init?: Partial<Company>) {
    Object.assign(this, init);
  }


}







