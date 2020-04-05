import { Message } from './message.model';









export class Conversation {
  // tslint:disable-next-line: variable-name
  _id: string; // the underscore is because the database named it like that
  participants: {
    _id: string,
    type: string,
    user: {
      _id: string, email: string, name?: string, firstName?: string, lastName?: string
    }
  }[];
  messages: Message[];
}

















