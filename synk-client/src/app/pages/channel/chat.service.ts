import { Injectable, Inject, forwardRef } from '@angular/core';

import { Observable, fromEvent, timer } from 'rxjs';

import {
  Message,
  RoomMessage,
  RoomUserConfig,
  RoomUserDto,
  RoomCommands
} from './models/room.models';
import { SocketService } from '../../socket.service';
import { map } from 'rxjs/operators';

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

  constructor(@Inject(forwardRef(() => SocketService)) private socketService: SocketService) { }

  sendDM(msg: string) {
    this.socketService.sendEvent({ command: RoomCommands.PM, payload: msg });
  }

  cok(msg: string) {
    this.socketService.emitIfConnected(sendMessage$)
      .subscribe(([{ socket, data }, username]) => {
        const [message, id] = data
        clearUserInput()
        addMessage(username, message) // Add own chat message to DOM
        socket.emit('chat message', { id, message })
      })
  }

  sendMessageToRoom(msg: Message, roomName: string) {
    const message: RoomMessage = {
      roomName,
      content: msg
    };
    this.socketService.sendEvent({ command: RoomCommands.GROUP_MESSAGE, payload: message });
  }

  enterRoom(name: string) {
    this.socketService.connect();
    this.socketService.sendEvent({ command: RoomCommands.JOIN_ROOM, payload: name });
  }

  giveLeader(member: RoomUserDto, name: string) {
    const ev = { to: member.userName, roomName: name };
    this.socketService.sendEvent({ command: RoomCommands.GIVE_LEADER, payload: ev });
  }

  exit(name: string) {
    this.socketService.sendEvent({ command: RoomCommands.EXIT_ROOM, payload: name });
    this.socketService.removeEventListener(RoomCommands.GROUP_MESSAGE);
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
