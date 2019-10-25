import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';

import { Observable, fromEvent, timer } from 'rxjs';

import { environment } from 'src/environments/environment';

export interface Message {
  userName?: string;
  text: string;
}

export interface RoomMessage {
  content: Message;
  roomName: string;
}

export interface MediaEvent {
  mediaUrl: string;
  currentTime: number;
  roomName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  messageQueue: Message[] = [];

  disconnect$: Observable<string[]>;

  privateMessage$: Observable<string[]>;

  roomMessages$: Observable<Message[]> = new Observable(observer => {
    this.socket.on('group message', (data: RoomMessage) => {
      this.messageQueue = this.messageQueue.concat(data.content);
      observer.next(this.messageQueue);
    });
  });

  roomMediaEvent$: Observable<MediaEvent> = new Observable(observer => {
    this.socket.on('media event', (data: MediaEvent) => {
      observer.next(data);
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

  sendMessageToRoom(msg: Message, roomName: string) {
    const message: RoomMessage = {
      roomName,
      content: msg
    };
    this.socket.emit('group message', message);
  }

  enterRoom(name: string) {
    this.socket.connect();
    this.socket.emit('join room', name);
  }

  exit(name: string) {
    this.socket.emit('exit room', name);
    this.socket.off('group message');
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
