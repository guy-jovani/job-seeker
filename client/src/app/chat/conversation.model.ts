import { Message } from './message.model';









export class Conversation {
  _id: string; // the underscore is because the database named it like that
  participants: {
    _id: string,
    type: string,
    user: {
      _id: string, name?: string, firstName?: string, lastName?: string
    }
  }[];
  messages: Message[];

}

















