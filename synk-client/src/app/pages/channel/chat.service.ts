import { Injectable } from '@angular/core';

import { Observable, fromEvent, timer } from 'rxjs';

import {
  Message,
  RoomMessage,
  RoomUserConfig,
  RoomUserDto,
  RoomCommands
} from './models/room.models';
import { SocketService, RealTimeCommand } from '../../socket.service';
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

  alreadyJoinedRoomError$ = this.socketService.listenForEvent('already joined');

  roomUserConfig$ = this.socketService.listenForEvent<RoomUserConfig>(RoomCommands.USER_CONFIG);

  roomUserList$ = this.socketService.listenForEvent<RoomUserDto[]>(RoomCommands.USER_LIST_UPDATE);

  constructor(private socketService: SocketService) { }

  sendMessageToRoom(): (src: Observable<RoomMessage>) => Observable<RealTimeCommand> {
    return (src: Observable<RoomMessage>) =>
      src.pipe(
        map(({ content, roomName }) => ({
          command: RoomCommands.GROUP_MESSAGE,
          payload: { roomName, content }
        })),
        this.socketService.emitCommand(),
      );
  }

  enterRoom(roomName: string) {
    this.socketService.socket.emit(RoomCommands.JOIN_ROOM, roomName);
  }

  giveLeader({ member, roomName }: { member: RoomUserDto, roomName: string }) {
    this.socketService.socket.emit(RoomCommands.GIVE_LEADER, { to: member.userName, roomName });
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
