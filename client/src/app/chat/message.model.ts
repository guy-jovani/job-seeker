







export class Message {
  public creator: string;
  public content: string;
  public createdAt: Date;
  // tslint:disable-next-line: variable-name
  public _id?: string; // the underscore is because the database named it like that

  constructor(init?: Partial<Message>) {
    Object.assign(this, init);
  }
}
