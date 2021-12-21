import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import {
  Message,
  RoomMessage,
  RoomUserConfig,
  RoomUser,
  RoomCommands,
  RoomErrors
} from './models/room.models';
import { SocketService, RealTimeCommand } from '../../socket.service';
import { filter, map, share, shareReplay, tap } from 'rxjs/operators';
import { doLog } from 'src/app/utils/custom.operators';

@Injectable()
export class ChatService {

  roomMessages$ = this.socketService.listenForEvent<Message[]>(RoomCommands.GROUP_MESSAGE);

  alreadyJoinedRoomError$ = this.socketService.exceptionEvent$.pipe(
    filter(({ message }) => message === RoomErrors.ALREADY_JOINED)
  );

  roomUserConfig$ = this.socketService.listenForEvent<RoomUserConfig>(RoomCommands.USER_CONFIG)
    .pipe(
      doLog('chat svc roomUserConfig', true),
     share()
    );

  userBecameLeader$ = this.socketService.listenForEvent<{}>(RoomCommands.YOU_ARE_LEADER).pipe(shareReplay(1));
  userPassedOnLeader$ = this.socketService.listenForEvent<{}>(RoomCommands.LEADER_ROLE_PASSED_ON_SUCCESS).pipe(shareReplay(1));

  roomUserList$ = this.socketService.listenForEvent<RoomUser[]>(RoomCommands.USER_LIST_UPDATE).pipe(shareReplay(1));

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
