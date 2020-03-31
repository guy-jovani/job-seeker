import { Company } from 'app/company/company.model';








export class Position {
  // tslint:disable-next-line: variable-name
  public _id: string; // the underscore is because the database named it like that
  public description: string;
  public title: string;
  public company: Partial<Company>;
  public requirements?: { requirement: string }[];
  public lastFetch: Date;
  public date: Date | string;

  constructor(init?: Partial<Position>) {
    Object.assign(this, init);
  }

}

















