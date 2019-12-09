import * as socketio from 'socket.io';

import { RoomUser, RoomUserConfig, Roles, RoomUserDto } from './user';
import {
  OutgoingGroupMessage,
  IncomingGroupMessage,
  MediaEvent
} from './message';
import { Playlist } from './playlist';

export class Room {
  name: string;
  description: string;
  creator: string;

  leader: RoomUser = null;
  users: RoomUser[] = [];

  playlists: Playlist[] = [];
  currentPlayList: Playlist | null = null;

  private io: socketio.Server;

  constructor(
    name: string,
    sio: socketio.Server,
    originSocket?: socketio.Socket
  ) {
    this.io = sio;
    this.name = name;

    this.creator = originSocket ? originSocket.request.user.username : 'Lain';

    const defaultPlaylist = new Playlist('default');
    this.currentPlayList = defaultPlaylist;
    this.playlists.push(defaultPlaylist);

    console.log(`Created room [${name}]`);
  }

  join(socket: socketio.Socket) {
    console.log('JOING ', this.name);
    const newuser = this.createRoomUser(socket);

    console.log(newuser);
    socket.join(this.name);

    if (this.users.length === 0) {
      console.log('### NEW LEAZDER', newuser);
      this.setLeader(newuser);
    }

    this.users.push(newuser);
    this.sendUserRoomConfig(socket);

    const userJoined: OutgoingGroupMessage = {
      roomName: this.name,
      content: {
        userName: 'info',
        text: `${newuser.userName} joined`
      }
    };

    this.io.to(this.name).emit('group message', userJoined);
  }

  exit(socket: socketio.Socket) {
    const user = this.getUserFromSocket(socket);
    console.log('## EXIT SOCEUSER', user);

    if (user) {
      this.users = this.users.filter(it => it.userName !== user.userName);

      if (this.leader && user.userName === this.leader.userName) {
        const newLeader = this.users[0] || null;
        if (newLeader) {
          this.setLeader(newLeader);
        }
      }

      const userLeft: OutgoingGroupMessage = {
        roomName: this.name,
        content: {
          userName: 'info',
          text: `${user.userName} left`
        }
      };
      this.io.to(this.name).emit('group message', userLeft);
    }
    socket.leave(this.name);
  }

  setLeader(user: RoomUser) {
    this.leader = user;
  }

  sendMessageToRoom(socket: socketio.Socket, msg: IncomingGroupMessage) {
    const message: OutgoingGroupMessage = {
      roomName: this.name,
      content: {
        text: msg.content.text,
        userName: socket.request.user.username
      }
    };
    this.io.to(this.name).emit('group message', message);
  }

  emitMediaEventToUsers(socket: socketio.Socket, data: MediaEvent) {
    socket.to(this.name).emit('media event', data);
  }

  private createRoomUser(socket: socketio.Socket): RoomUser {
    return {
      id: socket.id,
      permissionLevel: 1,
      userName: socket.request.user.username,
      role: Roles.Regular
    };
  }

  private getUserFromSocket(socket: socketio.Socket): RoomUser | null {
    const user = this.users.find(
      u => u.userName === socket.request.user.username
    );
    return user;
  }

  private sendUserRoomConfig(socket: socketio.Socket) {
    const userConfig = this.getConfigForSocket(socket);
    socket.emit('user config', userConfig);
  }

  private getConfigForSocket(socket: socketio.Socket) {
    const user = this.getUserFromSocket(socket);
    const userLs: RoomUserDto[] = this.users.map(u => {
      return {
        ...u,
        isLeader: this.isLeader(u)
      };
    });

    return {
      playlist: this.currentPlayList.list,
      isLeader: this.isLeader(user),
      isAdmin: false,
      permissionLevel: 1,
      role: Roles.Regular,
      members: userLs
    };
  }
  private isLeader(user: RoomUser): boolean {
    return this.leader && this.leader.userName === user.userName;
  }

  private assignRoleToUser(socket: socketio.Socket) { }

  private assignPermissionToUser(socket: socketio.Socket) { }

}
