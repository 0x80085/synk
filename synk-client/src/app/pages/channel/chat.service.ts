import { Injectable } from '@angular/core';

import { Observable, fromEvent, timer } from 'rxjs';

import {
  Message,
  RoomMessage,
  RoomUserConfig,
  RoomUserDto,
  RoomCommands
} from './models/room.models';
import { SocketService } from '../../socket.service';
import { map, withLatestFrom, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  messageQueue: Message[] = [];

  // roomMessages$: Observable<Message[]> = new Observable(observer => {
  //   this.socketService.on('group message', (data: RoomMessage) => {
  //     this.messageQueue = this.messageQueue.concat(data.content);
  //     observer.next(this.messageQueue);
  //   });
  // });
  // roomUserConfig$: Observable<RoomUserConfig> = new Observable(observer => {
  //   this.socketService.on('user config', (data: RoomUserConfig) => {
  //     this.state.isLoggedInSubject.next(true);
  //     this.state.isSocketConnectedSub.next(true);
  //     observer.next(data);
  //   });
  // });
  // roomUserList$: Observable<RoomUserDto[]> = new Observable(observer => {
  //   this.socket.on('userlist update', (data: RoomUserDto[]) => {
  //     observer.next(data);
  //   });
  // });

  roomMessages$ = this.socketService.listenForEventIfConnected(RoomCommands.GROUP_MESSAGE).pipe(
    map((data: RoomMessage) => {
      this.messageQueue = this.messageQueue.concat(data.content);
      return this.messageQueue;
    })
  );

  roomUserConfig$ = this.socketService.listenForEventIfConnected(RoomCommands.USER_CONFIG).pipe(
    map((data: RoomUserConfig) => {
      return data;
    })
  );

  roomUserList$ = this.socketService.listenForEventIfConnected(RoomCommands.USER_LIST_UPDATE).pipe(
    map((data: RoomUserDto[]) => {
      return data;
    })
  );

  constructor(private socketService: SocketService) { }

  // sendDM(msg: string) {
  //   this.socketService.sendEvent({ command: RoomCommands.PM, payload: msg });
  // }

  sendGroupMessage(obs: Observable<RoomMessage>) {
    return this.socketService.emitIfConnected(obs)
      .subscribe(({ socket, data }) => {
        const message: RoomMessage = {
          roomName: data.roomName,
          content: data.content
        };
        socket.emit(RoomCommands.GROUP_MESSAGE, message);
      });
  }

  // sendMessageToRoom(msg: Message, roomName: string) {
  //   const message: RoomMessage = {
  //     roomName,
  //     content: msg
  //   };
  //   this.socketService.sendEvent({ command: RoomCommands.GROUP_MESSAGE, payload: message });
  // }

  enterRoom<T>(roomName: string): (src: Observable<T>) => Observable<T> {
    return (source: Observable<T>) =>
      source.pipe(
        tap(() =>console.log('enterroom')),
        withLatestFrom(this.socketService.socket$),
        tap(([_, socket]) => {
          console.log(`command :${RoomCommands.JOIN_ROOM} : roomName: ${roomName}`);

          socket.emit(RoomCommands.JOIN_ROOM, roomName);
        }),
        map(([src]) => src),
      );
  }

  // enterRoom(obs: Observable<string>) {
  //   return this.socketService.emitIfConnected(obs)
  //     .subscribe(({ socket, data: roomName }) => {
  //       socket.emit(RoomCommands.JOIN_ROOM, roomName);
  //     });

  //   // this.socketService.connect();
  //   // this.socketService.sendEvent({ command: RoomCommands.JOIN_ROOM, payload: name });
  // }

  giveLeader(obs: Observable<{ member: RoomUserDto, roomName: string }>) {
    return this.socketService.emitIfConnected(obs)
      .subscribe(({ socket, data: { member, roomName } }) => {
        const ev = { to: member.userName, roomName };
        socket.emit(RoomCommands.GIVE_LEADER, ev);
      });

    // this.socketService.sendEvent({ command: RoomCommands.GIVE_LEADER, payload: ev });
  }

  exit(obs: Observable<string>) {
    return this.socketService.emitIfConnected(obs)
      .subscribe(({ socket, data: roomName }) => {
        socket.emit(RoomCommands.EXIT_ROOM, roomName);
        socket.off(RoomCommands.GROUP_MESSAGE);
        this.messageQueue = [];

      });
    // this.socketService.sendEvent({ command: RoomCommands.EXIT_ROOM, payload: name });
    // this.socketService.removeEventListener(RoomCommands.GROUP_MESSAGE);
    // this.messageQueue = [];
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
