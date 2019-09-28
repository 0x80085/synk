import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';
import { Observable, fromEvent, timer } from 'rxjs';

export interface Message {
  msg: string;
}

export interface GroupMessage {
  msg: Message;
  roomName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  messageQueue: Message[] = [];

  disconnect$: Observable<string[]>;

  privateMessage$: Observable<string[]>;

  groupMessages$: Observable<Message[]> = new Observable(observer => {
    this.socket.on('group message', (data: GroupMessage) => {
      this.messageQueue = this.messageQueue.concat(data.msg);
      observer.next(this.messageQueue);
      console.log(data);
    });
  });

  private socket: SocketIOClient.Socket;

  constructor() {
    this.socket = io('http://localhost:3000');

    this.disconnect$ = fromEvent(this.socket, 'disconnect');
    this.privateMessage$ = fromEvent(this.socket, 'private message');
  }

  joinRoom(name: string) {
    this.socket.emit('join room', name);
  }

  sendDM(msg: string) {
    this.socket.emit('private message', msg);
  }

  sendGM(msg: Message, roomName: string) {
    this.socket.emit('group message', { msg, roomName });
  }

  setupMessageQueueGCTimer() {
    timer(500).pipe()
      .subscribe(
        value => {
          console.log(value);

          this.messageQueue = this.messageQueue.slice(0, -50);
        },
        err => console.log(err),
      );
  }

  flushQueue() {
    this.messageQueue = [];
    this.groupMessages$ = new Observable(observer => {
      observer.next(this.messageQueue);
    });
  }
}
