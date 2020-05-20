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

  roomMessages$ = this.socketService.listenForEvent(RoomCommands.GROUP_MESSAGE).pipe(
    map((data: RoomMessage) => {
      this.messageQueue = this.messageQueue.concat(data.content);
      return this.messageQueue;
    })
  );

  roomUserConfig$ = this.socketService.listenForEvent(RoomCommands.USER_CONFIG).pipe(
    map((data: RoomUserConfig) => {
      return data;
    })
  );

  roomUserList$ = this.socketService.listenForEvent(RoomCommands.USER_LIST_UPDATE).pipe(
    map((data: RoomUserDto[]) => {
      return data;
    })
  );

  constructor(private socketService: SocketService) { }

  // sendDM(msg: string) {
  //   this.socketService.sendEvent({ command: RoomCommands.PM, payload: msg });
  // }

  sendMessageToRoom(msg: Message, roomName: string) {
    const message: RoomMessage = {
      roomName,
      content: msg
    };
    this.socketService.socket.emit(RoomCommands.GROUP_MESSAGE, message);
  }


  enterRoom(roomName: string) {
    console.log('enterroom');

    this.socketService.socket.emit(RoomCommands.JOIN_ROOM, roomName);
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
    return this.socketService.emit(obs)
      .subscribe(({ socket, data: { member, roomName } }) => {
        const ev = { to: member.userName, roomName };
        socket.emit(RoomCommands.GIVE_LEADER, ev);
      });

    // this.socketService.sendEvent({ command: RoomCommands.GIVE_LEADER, payload: ev });
  }
  exit(name: string) {
    this.socketService.socket.emit(RoomCommands.EXIT_ROOM, name);
    this.socketService.socket.off(RoomCommands.GROUP_MESSAGE);
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
