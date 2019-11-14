import * as socketio from "socket.io";

import { RoomUser, Roles, PermissionLevels } from "./user";
import {
  OutgoingGroupMessage,
  IncomingGroupMessage,
  MediaEvent
} from "./message";

export class Room {
  name: string;
  description: string;
  users: RoomUser[] = [];
  leader: RoomUser = null;

  private io: socketio.Server;

  constructor(name: string, creator: socketio.Socket, _io: socketio.Server) {
    this.io = _io;
    this.name = name;
    const leader = this.setLeader(creator);
    // this.setAdmin(creator);
    console.log(`Created room [${name}] with leader [${leader.userName}]`);
  }

  join(socket: socketio.Socket) {
    socket.join(this.name);

    const response: OutgoingGroupMessage = {
      roomName: this.name,
      content: {
        userName: "info",
        text: "user joined"
      }
    };
    this.io.to(this.name).emit("group message", response);
  }

  setLeader(socket: socketio.Socket) {
    const ld = socket
      ? {
          id: socket.id,
          permissionLevel: 10 as PermissionLevels,
          role: Roles.Leader,
          userName: `${socket.id.substring(5)}-LEADR`
        }
      : {
          id: "_NO_LEADER_ID_",
          permissionLevel: 10 as PermissionLevels,
          role: Roles.Leader,
          userName: "NO LEADER"
        };

    this.leader = ld;
    return this.leader;
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
    const user = this.getUserFromSocket(socket);
    this.throwIfNotRole(user.role, Roles.Leader);

    socket.to(this.name).emit("media event", data);
  }

  private getUserFromSocket(socket: socketio.Socket): RoomUser {
    const user = this.users.find(u => u.id === socket.id);

    if (!user) {
      throw Error("User not in room");
    }

    return user;
  }

  private assignRoleToUser(socket: socketio.Socket) {}

  private assignPermissionToUser(socket: socketio.Socket) {}

  private throwIfNotPermitted(
    userPermissionLevel: number,
    RequiredPermissionLevel: number
  ): void {
    if (userPermissionLevel < RequiredPermissionLevel) {
      throw Error("Not Permitted");
    }
  }

  private throwIfNotRole(userRole: Roles, requiredRole: Roles): void {
    if (userRole !== requiredRole) {
      throw Error("Not Permitted");
    }
  }
}
