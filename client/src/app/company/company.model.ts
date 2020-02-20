
import { Position } from 'app/position/position.model';







export class Company {
  public _id: string;
  public name: string;
  public email?: string;
  public description?: string;
  public website?: string;
  public imagePath?: string;
  public positions?: Position[];
  public lastFetch?: Date;

  constructor(init?: Partial<Company>) {
    Object.assign(this, init);
  }


}







