







export class Message {
  public creator: string;
  public content?: string | File;
  public createdAt: Date;
  public first: string;
  public time: string;
  // tslint:disable-next-line: variable-name
  public _id?: string; // the underscore is because the database named it like that
  public filePath?: string;
  public fileName?: string;
  public fileSize?: string;
  constructor(init?: Partial<Message>) {
    Object.assign(this, init);
  }
}
