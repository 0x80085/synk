import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';
import { Observable, fromEvent } from 'rxjs';

export interface Message {
  msg: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: SocketIOClient.Socket;

  public messageQueue: Observable<string[]>;

  disconnect$: Observable<string[]>;
  groupMessage$: Observable<Message>;
  privateMessage$: Observable<string[]>;

  constructor() {
    this.socket = io('http://localhost:3000');

    this.disconnect$ = fromEvent(this.socket, 'disconnect');
    this.privateMessage$ = fromEvent(this.socket, 'private message');

    this.groupMessage$ = new Observable(observer => {
      this.socket.on('group message', (data: Message) => {
        observer.next(data);
        console.log(data);
      });
    });
  }

  joinRoom(name: string) {
    this.socket.emit('join room', name);
  }

  sendDM(msg: string) {
    this.socket.emit('private message', msg);
  }
}
