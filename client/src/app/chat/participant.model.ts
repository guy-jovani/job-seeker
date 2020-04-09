


export class Participant {
  // tslint:disable-next-line: variable-name
  _id: string; // the underscore is because the database named it like that
  type: string;
  read: boolean;
  user: {
    _id: string, email: string, name?: string, firstName?: string, lastName?: string
  };
}



