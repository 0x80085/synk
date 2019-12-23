import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';

import { Observable, fromEvent, timer } from 'rxjs';

import { environment } from 'src/environments/environment';
import {
  Message,
  RoomMessage,
  MediaEvent,
  RoomUserConfig,
  RoomUserDto
} from './models/room.models';
import { AppStateService } from 'src/app/app-state.service';

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
      this.state.isLoggedInSubject.next(true);
      this.state.isSocketConnectedSub.next(true);

      observer.next(data);
    });
  });

  roomUserList$: Observable<RoomUserDto[]> = new Observable(observer => {
    this.socket.on('userlist update', (data: RoomUserDto[]) => {
      observer.next(data);
    });
  });

  roomPlaylist$: Observable<MediaEvent[]> = new Observable(observer => {
    this.socket.on('playlist update', (data: MediaEvent[]) => {
      observer.next(data);
    });
  });

  permissionErrorEvent$: Observable<Message[]> = new Observable(observer => {
    this.socket.on('error', (data: any) => {
      this.messageQueue = [{ text: 'Error connecting', userName: '>:)' }];
      observer.next(this.messageQueue);

      this.state.isLoggedInSubject.next(false);
      this.state.isSocketConnectedSub.next(false);

      this.socket.close();
    });
  });

  connectionErrorEvent$: Observable<Message[]> = new Observable(observer => {
    this.socket.on('connect_error', (data: any) => {
      console.log('connect error', data);
      this.messageQueue = [{ text: 'Error connecting', userName: '>:)' }];
      observer.next(this.messageQueue);

      this.state.isLoggedInSubject.next(false);
      this.state.isSocketConnectedSub.next(false);

      this.socket.close();
    });
  });

  connectionTimeOutEvent$: Observable<Message[]> = new Observable(observer => {
    this.socket.on('connect_timeout', (data: any) => {
      this.state.isSocketConnectedSub.next(false);
      this.socket.close();
    });
  });

  connectionSuccessEvent$: Observable<Message[]> = new Observable(observer => {
    this.socket.on('connect', (data: any) => {
      this.state.isLoggedInSubject.next(true);
      this.state.isSocketConnectedSub.next(true);
    });
  });

  private socket: SocketIOClient.Socket;

  constructor(private state: AppStateService) {
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

  addToPlaylist(ev: MediaEvent) {
    this.socket.emit('add media', ev);
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
