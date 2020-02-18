







export class Position {
  public _id: string; // the underscore is because the database named it like that
  public description: string;
  public title: string;
  public companyId: {_id: string, name?: string};
  public requirements?: { years: number, skill: string }[];

  constructor(init?: Partial<Position>) {
    Object.assign(this, init);
  }

}

















