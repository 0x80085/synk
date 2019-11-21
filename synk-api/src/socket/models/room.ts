import * as socketio from "socket.io";

import { RoomUser, RoomUserConfig, Roles, PermissionLevels } from "./user";
import {
  OutgoingGroupMessage,
  IncomingGroupMessage,
  MediaEvent
} from "./message";
import { Playlist } from "./playlist";

export class Room {
  name: string;
  description: string;

  leader: RoomUser = null;
  users: RoomUser[] = [];

  playlists: Playlist[] = [];

  private io: socketio.Server;

  constructor(name: string, creator: socketio.Socket, _io: socketio.Server) {
    this.io = _io;
    this.name = name;

    console.log(`Created room [${name}]`);
  }

  join(socket: socketio.Socket) {
    socket.join(this.name);

    const newuser = this.createUserFromSocket(socket);

    console.log(newuser);

    if (this.users.length === 0) {
      this.setLeader(newuser);
    }

    this.users.push(newuser);

    const userJoined: OutgoingGroupMessage = {
      roomName: this.name,
      content: {
        userName: "info",
        text: "user joined"
      }
    };

    this.sendUserRoomConfig(socket);

    this.io.to(this.name).emit("group message", userJoined);
  }

  setLeader(user: RoomUser) {
    this.leader = user;
  }

  setAdmin(socket: socketio.Socket) {
    // this.admin = getUserByScket(socket);
  }

  exit(socket: socketio.Socket) {
    console.log("exit raum", this.name);

    const response: OutgoingGroupMessage = {
      roomName: this.name,
      content: { userName: "info", text: "user left" }
    };
    socket.to(this.name).emit("group message", response);
    socket.leave(this.name);
  }

  sendMessageToRoom(socket: socketio.Socket, msg: IncomingGroupMessage) {
    const message: OutgoingGroupMessage = {
      roomName: this.name,
      content: {
        text: msg.content.text,
        userName: socket.request.user.username
      }
    };
    this.io.to(this.name).emit("group message", message);
  }

  emitMediaEventToUsers(socket: socketio.Socket, data: MediaEvent) {
    socket.to(this.name).emit("media event", data);
  }

  private createUserFromSocket(socket: socketio.Socket): RoomUser {
    const isLeader =
      this.leader && this.leader.userName === socket.request.user.username;

    return {
      id: socket.id,
      permissionLevel: 1,
      isLeader,
      userName: socket.request.user.username,
      role: Roles.Regular
    };
  }

  private getUserFromSocket(socket: socketio.Socket): RoomUser | null {
    const user = this.users.find(u => u.id === socket.id);
    return user;
  }

  private sendUserRoomConfig(socket: socketio.Socket) {
    const isLeader =
      this.leader && this.leader.userName === socket.request.user.username;

    const userConfig: RoomUserConfig = {
      isLeader,
      isAdmin: false,
      permissionLevel: 1,
      role: Roles.Regular
    };

    console.log(userConfig);

    socket.emit("user config", userConfig);
  }

  private assignRoleToUser(socket: socketio.Socket) {}

  private assignPermissionToUser(socket: socketio.Socket) {}
}
