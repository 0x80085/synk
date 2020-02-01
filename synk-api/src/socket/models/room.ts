import * as socketio from 'socket.io';

import { RoomMember, RoomUserConfig, Roles, RoomMemberDto } from './user';
import {
  OutgoingGroupMessage,
  IncomingGroupMessage,
  MediaEvent
} from './message';
import { Playlist } from './playlist';
import { Logger } from '../../tools/logger';
import { getUsername } from './socket.passport';

export class Room {
  name: string;
  description: string;
  creator: string;

  leader: RoomMember = null;
  users: RoomMember[] = [];

  playlists: Playlist[] = [];
  currentPlayList: Playlist | null = null;

  private io: socketio.Server;
  logger: Logger;

  constructor(
    name: string,
    sIO: socketio.Server,
    logger: Logger,
    originSocket?: socketio.Socket,
  ) {
    this.io = sIO;
    this.logger = logger;
    this.name = name;

    this.creator = originSocket ? getUsername(originSocket) : 'Lain';

    const defaultPlaylist = new Playlist('default');
    this.currentPlayList = defaultPlaylist;
    this.playlists.push(defaultPlaylist);
  }

  join(socket: socketio.Socket) {
    this.addMemberFromSocket(socket);

    this.sendRoomConfigToUser(socket);
    this.sendPlaylistToUser(socket);

    this.broadcastUserListToMembers();
  }

  exit(socket: socketio.Socket) {
    const user = this.getMemberFromSocket(socket);

    if (user) {
      this.users = this.users.filter(it => it.userName !== user.userName);

      if (this.leader && user.userName === this.leader.userName) {
        const newLeader = this.users[0] || null;
        if (newLeader) {
          this.logger.info(`New leader in room ${this.name} is ${newLeader}`);
          console.log(`New leader in room ${this.name} is ${newLeader}`);
          this.setLeader(newLeader);
        }
      }
      this.sendMsgToMembers('info', `${user.userName} left`);
      this.broadcastUserListToMembers();
    }
    socket.leave(this.name);
  }

  broadcastMessageToMembers(socket: socketio.Socket, msg: IncomingGroupMessage) {
    const name = getUsername(socket);
    const userIsInRoom = this.users.filter(u => u.userName === name).length > 0;

    if (userIsInRoom) {
      this.sendMsgToMembers(name, msg.content.text);
    } else {
      this.logger.info(`User tried to send a message to a room where he does not have rights to`);
    }
  }

  broadcastPlaylistToMembers() {
    this.io.to(this.name).emit('playlist update', this.currentPlayList.list);
  }

  broadcastMediaEventToMembers(socket: socketio.Socket, data: MediaEvent) {
    socket.to(this.name).emit('media event', data);
  }

  broadcastUserListToMembers() {
    const userLs: RoomMemberDto[] = this.users.map(u => {
      return {
        ...u,
        isLeader: this.isLeader(u)
      };
    });

    this.io.to(this.name).emit('userlist update', userLs);
  }

  private setLeader(user: RoomMember) {
    this.leader = user;

    const socketRef = this.io.of('/').connected[this.leader.id];
    this.logger.info(`Leader socket :: ${socketRef || '( ´>_<`) Not found'}`);

    this.sendRoomConfigToUser(socketRef);
  }

  private createMember(socket: socketio.Socket): RoomMember {
    return {
      id: socket.id,
      permissionLevel: 1,
      userName: getUsername(socket),
      role: Roles.Regular
    };
  }

  private getMemberFromSocket(socket: socketio.Socket): RoomMember | null {
    const user = this.users.find(
      u => u.userName === getUsername(socket)
    );
    return user;
  }

  private sendPlaylistToUser(socket: socketio.Socket) {
    socket.emit('playlist update', this.currentPlayList.list);
  }

  private sendRoomConfigToUser(socket: socketio.Socket) {
    const userConfig = this.getConfigForSocket(socket);
    socket.emit('user config', userConfig);
  }

  private getConfigForSocket(socket: socketio.Socket): RoomUserConfig {
    const user = this.getMemberFromSocket(socket);

    return {
      isLeader: this.isLeader(user),
      isAdmin: false,
      permissionLevel: 1,
      role: Roles.Regular
    };
  }

  private addMemberFromSocket(socket: socketio.Socket) {
    try {
      const uname = getUsername(socket);
      const alreadyAdded = this.users.filter(u => u.userName === uname).length > 0;
      if (alreadyAdded) {
        return;
      }
      const newuser = this.createMember(socket);
      if (this.users.length === 0) {
        this.setLeader(newuser);
      }

      socket.join(this.name);
      this.users.push(newuser);

      this.sendMsgToMembers('info', `${newuser.userName} joined`);

    } catch (error) {
      socket.emit('authentication error');
      return;
    }
  }


  private isLeader(user: RoomMember) {
    return this.leader && this.leader.userName === user.userName;
  }

  private sendMsgToMembers(userName: string, text: string) {
    const groupMessage: OutgoingGroupMessage = {
      roomName: this.name,
      content: {
        userName,
        text
      }
    };
    this.io.to(this.name).emit('group message', groupMessage);
  }
}
