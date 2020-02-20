import { Company } from 'app/company/company.model';








export class Position {
  public _id: string; // the underscore is because the database named it like that
  public description: string;
  public title: string;
  public companyId: Company;
  public requirements?: { years: number, skill: string }[];
  public lastFetch: Date;

  constructor(init?: Partial<Position>) {
    Object.assign(this, init);
  }

}

















