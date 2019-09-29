import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';

import { Observable, fromEvent, timer } from 'rxjs';

import { environment } from 'src/environments/environment';

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
    });
  });

  private socket: SocketIOClient.Socket;

  constructor() {
    this.socket = io(`${environment.api}`);
    this.disconnect$ = fromEvent(this.socket, 'disconnect');
    this.privateMessage$ = fromEvent(this.socket, 'private message');
  }

  sendDM(msg: string) {
    this.socket.emit('private message', msg);
  }

  sendGM(msg: Message, roomName: string) {
    this.socket.emit('group message', { msg, roomName });
  }

  enter(name: string) {
    this.socket.connect();
    this.socket.emit('join room', name);
  }

  exit() {
    this.socket.off('group message');
    this.socket.disconnect();
    this.messageQueue = [];
  }

  // setupMessageQueueGCTimer() {
  //   timer(500).pipe()
  //     .subscribe(
  //       value => {
  //         console.log(value);

  //         this.messageQueue = this.messageQueue.slice(0, -50);
  //       },
  //       err => console.log(err),
  //     );
  // }

  // flushQueue() {
  //   this.messageQueue = [];
  //   this.groupMessages$ = new Observable(observer => {
  //     observer.next(this.messageQueue);
  //   });
  // }
}
