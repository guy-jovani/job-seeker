



import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';




@Injectable({
  providedIn: 'root'
})
export class ChatService {

    constructor(private socket: Socket) { }

    sendMessage(eventName: string, data: {}) {
      return this.socket.emit(eventName, data, ret => {
        console.log(ret)
        return ret;
      });
    }
     getMessage(eventName: string) {
        return this.socket.fromEvent(eventName);
    }
}












