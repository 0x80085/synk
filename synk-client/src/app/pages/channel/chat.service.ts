import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';

import { Observable, fromEvent, timer } from 'rxjs';

import { environment } from 'src/environments/environment';
import {
  Message,
  RoomMessage,
  MediaEvent,
  RoomUserConfig
} from './models/room.models';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  messageQueue: Message[] = [];

  roomMessages$: Observable<Message[]> = new Observable(observer => {
    this.socket.on('group message', (data: RoomMessage) => {
      this.messageQueue = this.messageQueue.concat(data.content);
      observer.next(this.messageQueue);
    });
  });

  roomMediaEvent$: Observable<MediaEvent> = new Observable(observer => {
    this.socket.on('media event', (data: MediaEvent) => {
      console.log('media event received', data.currentTime);

      observer.next(data);
    });
  });

  roomUserConfig$: Observable<RoomUserConfig> = new Observable(observer => {
    this.socket.on('user config', (data: RoomUserConfig) => {
      console.log('config event received', data);

      observer.next(data);
    });
  });

  permissionErrorEvent$: Observable<Message[]> = new Observable(observer => {
    this.socket.on('error', (data: any) => {
      console.log('error event received', data);
      this.messageQueue = [{ text: 'Error connecting', userName: '>:)' }];
      observer.next(this.messageQueue);
      this.socket.close();
    });
  });

  private socket: SocketIOClient.Socket;

  constructor() {
    this.init();
  }

  init() {
    this.socket = io(`${environment.api}`);
  }

  reconnect() {
    this.socket.close();
    this.socket.open();
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

  sendMediaEvent(mediaUrl: string, currentTime: number, roomName: string) {
    const ev: MediaEvent = {
      currentTime,
      mediaUrl,
      roomName
    };
    this.socket.emit('media event', ev);
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
