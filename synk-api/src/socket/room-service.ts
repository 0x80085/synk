import * as socketio from "socket.io";

import { Room } from "./room";
import {
  IncomingGroupMessage,
  MediaEvent
} from "./messages";

export class RoomService {
  public publicRooms: Room[] = [];

  private io: socketio.Server;

  constructor(_io: socketio.Server) {
    this.io = _io;
  }

  public setupListeners(socket: socketio.Socket) {
    socket.on("private message", (from, msg) => {
      console.log("I received a private message by ", from, " saying ", msg);
    });

    socket.on("join room", roomName => {
      this.joinRoom(socket, roomName);
    });

    socket.on("exit room", roomName => {
      this.exitRoom(socket, roomName);
    });

    socket.on("group message", (data: IncomingGroupMessage) => {
      const room = this.getRoom(data.roomName);

      if (!room) {
        throw Error("Room non-existant");
      }

      room.sendMessageToRoom(socket, data)
    });

    socket.on("media event", (data: MediaEvent) => {
      this.io.to(data.roomName).emit("media event", data);
    });

    socket.on("disconnect", () => {
      console.log("disconnect");
      this.io.emit("user disconnected");
    });
  }

  private joinRoom(socket: socketio.Socket, roomName: string) {
    const room = this.getRoom(roomName);

    if (!room) {
      const newRoom = this.createNewRoom(socket, roomName);
      this.addRoomToDirectory(newRoom);
      newRoom.join(socket);
      return;
    }

    room.join(socket);
  }

  private exitRoom(socket: socketio.Socket, roomName: string) {
    console.log("exit raum", roomName);

    const room = this.getRoom(roomName);

    if (!room) {
      throw Error("Room non-existant");
    }

    room.exitRoom(socket);
  }

  private addRoomToDirectory(room: Room) {
    this.publicRooms.push(room);
  }

  private getRoom(roomName: string) {
    return this.publicRooms.find(r => r.name === roomName);
  }

  private createNewRoom(socket: socketio.Socket, roomName: string) {
    return new Room(roomName, socket, this.io);
  }
}
