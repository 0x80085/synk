import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import {
  Message,
  RoomMessage,
  RoomUserConfig,
  RoomUser,
  RoomCommands
} from './models/room.models';
import { SocketService, RealTimeCommand } from '../../socket.service';
import { filter, map } from 'rxjs/operators';

@Injectable()
export class ChatService {

  roomMessages$ = this.socketService.listenForEvent<Message[]>(RoomCommands.GROUP_MESSAGE);

  alreadyJoinedRoomError$ = this.socketService.permissionError$.pipe(
    filter((msg) => msg === "already joined")
  );

  roomUserConfig$ = this.socketService.listenForEvent<RoomUserConfig>(RoomCommands.USER_CONFIG);

  roomUserList$ = this.socketService.listenForEvent<RoomUser[]>(RoomCommands.USER_LIST_UPDATE);

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

  giveLeader({ member, roomName }: { member: RoomUser, roomName: string }) {
    this.socketService.socket.emit(RoomCommands.GIVE_LEADER, { to: member.username, roomName });
  }

  exit(name: string) {
    this.socketService.socket.emit(RoomCommands.EXIT_ROOM, name);
    this.socketService.socket.off(RoomCommands.GROUP_MESSAGE);
  }
}
