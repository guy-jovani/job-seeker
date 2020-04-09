import { Message } from './message.model';
import { Participant } from './participant.model';





export class Conversation {
  // tslint:disable-next-line: variable-name
  _id: string; // the underscore is because the database named it like that
  participants: Participant[];
  messages: Message[];
}

















