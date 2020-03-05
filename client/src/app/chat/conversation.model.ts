








export class Conversation {
  public _id: string; // the underscore is because the database named it like that
  public participants: {
    _id: string,
    type: string,
    user: {
      _id: string, name?: string, firstName?: string, lastName?: string
    }
  }[];
  public messages: Message[];

}



class Message {
  sender: { _id: string, name: string };
  content: string;
  createdAt: Date;
}













