import * as socketio from "socket.io";

import { Room } from "../models/room";
import { IncomingGroupMessage, MediaEvent } from "../models/message";

export class RoomService {
  private io: socketio.Server;

  public publicRooms: Room[] = [];

  constructor(_io: socketio.Server) {
    this.io = _io;

    const defaultRoom = new Room("SNKD", null, this.io);
    this.publicRooms.push(defaultRoom);
  }

  public setupListeners(socket: socketio.Socket){
    socket.on("private message", (from, msg) => {
      console.log("I received a private message by ", from, " saying ", msg);
    });

    socket.on("join room", roomName => {
      console.log(socket.request.session);
      console.log(socket.request.isAuthenticated());
      this.joinRoom(socket, roomName);
    });

    socket.on("exit room", roomName => {
      this.exitRoom(socket, roomName);
    });

    socket.on("group message", (data: IncomingGroupMessage) => {
      const room = this.getRoom(data.roomName);
      console.log(socket.request.session);
      console.log(socket.request.isAuthenticated());

      if (!room) {
        return Error("Room non-existant");
      }

      room.sendMessageToRoom(socket, data);
    });

    socket.on("media event", (data: MediaEvent) => {
      console.log("media event received", data.currentTime);

      this.io.to(data.roomName).emit("media event", data);
    });

    socket.on("disconnect", () => {
      console.log("disconnect");
      this.io.emit("user disconnected");
    });
  }

  public createRoom(data: { name: string; description: string }) {
    const newRoom = new Room(data.name, null, this.io);
    newRoom.description = data.description;

    this.addRoomToDirectory(newRoom);
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
    const room = this.getRoom(roomName);

    if (!room) {
      return Error("Room non-existant");
    }

    room.exit(socket);
  }

  private addRoomToDirectory(room: Room) {
    if (this.getRoom(room.name)) {
      console.log("##### ERR ROOM ALREADY EXiSTS");
      throw Error("Room already exists");
    }
    this.publicRooms.push(room);
  }

  private getRoom(roomName: string) {
    return this.publicRooms.find(r => r.name === roomName);
  }

  private createNewRoom(socket: socketio.Socket, roomName: string) {
    return new Room(roomName, socket, this.io);
  }
}
