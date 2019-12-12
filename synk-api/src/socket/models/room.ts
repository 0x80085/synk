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
    sIO: socketio.Server,
    originSocket?: socketio.Socket
  ) {
    this.io = sIO;
    this.name = name;

    this.creator = originSocket ? this.getUsername(originSocket) : 'Lain';

    const defaultPlaylist = new Playlist('default');
    this.currentPlayList = defaultPlaylist;
    this.playlists.push(defaultPlaylist);

    console.log(`Created room [${name}]`);
  }

  join(socket: socketio.Socket) {
    console.log('JOING ', this.name);

    this.addSocketToRoom(socket);

    this.sendRoomConfigToUser(socket);
    this.sendPlaylistToUser(socket);

    this.emitUserListToRoom();
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
      this.emitUserListToRoom();
    }
    socket.leave(this.name);
  }

  sendMessageToRoom(socket: socketio.Socket, msg: IncomingGroupMessage) {
    const message: OutgoingGroupMessage = {
      roomName: this.name,
      content: {
        text: msg.content.text,
        userName: this.getUsername(socket)
      }
    };
    this.io.to(this.name).emit('group message', message);
  }

  emitPlaylistToRoom() {
    console.log('emitPLayListToRoom', this.currentPlayList.list);
    this.io.to(this.name).emit('playlist update', this.currentPlayList.list);
  }

  emitMediaEventToUsers(socket: socketio.Socket, data: MediaEvent) {
    socket.to(this.name).emit('media event', data);
  }

  emitUserListToRoom() {
    const userLs: RoomUserDto[] = this.users.map(u => {
      return {
        ...u,
        isLeader: this.isLeader(u)
      };
    });
    console.log('emitUserListToRoom', userLs);

    this.io.to(this.name).emit('userlist update', userLs);
  }

  private setLeader(user: RoomUser) {
    this.leader = user;
  }

  private createRoomUser(socket: socketio.Socket): RoomUser {
    return {
      id: socket.id,
      permissionLevel: 1,
      userName: this.getUsername(socket),
      role: Roles.Regular
    };
  }

  private getUserFromSocket(socket: socketio.Socket): RoomUser | null {
    const user = this.users.find(
      u => u.userName === this.getUsername(socket)
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
    const user = this.getUserFromSocket(socket);

    return {
      isLeader: this.isLeader(user),
      isAdmin: false,
      permissionLevel: 1,
      role: Roles.Regular
    };
  }

  private addSocketToRoom(socket: socketio.Socket) {
    try {
      const uname = this.getUsername(socket);
      const alreadyAdded = this.users.filter(u => u.userName === uname).length > 0;
      if (alreadyAdded) {
        return;
      }
      const newuser = this.createRoomUser(socket);
      if (this.users.length === 0) {
        console.log('### NEW LEAZDER', newuser);
        this.setLeader(newuser);
      }

      socket.join(this.name);
      this.users.push(newuser);

      const userJoined: OutgoingGroupMessage = {
        roomName: this.name,
        content: {
          userName: 'info',
          text: `${newuser.userName} joined`
        }
      };

      this.io.to(this.name).emit('group message', userJoined);

    } catch (error) {
      console.log('ERROR SOCKET ILLEAGL STATE');
      socket.emit('authentication error');
      return;
    }
  }

  private getUsername(socket: socketio.Socket): string {
    return socket.request.user.username;
  }

  private isLeader(user: RoomUser) {
    return this.leader && this.leader.userName === user.userName;
  }

  private assignRoleToUser(socket: socketio.Socket) { }

  private assignPermissionToUser(socket: socketio.Socket) { }

}
