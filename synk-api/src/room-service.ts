import * as socketio from "socket.io";

export interface Room {
  name: string;
}

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
      console.log("tryna create raum", roomName);
      this.joinRoom(socket, roomName);
    });

    socket.on("disconnect", () => {
      this.io.emit("user disconnected");
    });
  }

  joinRoom(socket: socketio.Socket, roomName: string) {
    if (!this.roomExists(roomName)) {
      this.addRoomToDirectory({ name: roomName });
    }

    socket.join(roomName);

    this.io.to(roomName).emit("user joined");
  }

  private addRoomToDirectory(room: Room) {
    this.publicRooms.push(room);
  }

  private roomExists(roomName: string) {
    return this.publicRooms.filter(r => r.name === roomName).length > 0;
  }
}
