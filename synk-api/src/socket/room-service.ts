import * as socketio from "socket.io";

export interface Room {
  name: string;
}

export interface Message {
  msg: string;
}

export interface GroupMessage {
  msg: Message;
  roomName: string
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
      this.joinRoom(socket, roomName);
    });

    socket.on("exit room", roomName => {
      this.exitRoom(socket, roomName);
    });

    socket.on("group message", (data: GroupMessage) => {
      // socket.to(data.roomName).emit("group message", data);
      this.io.to(data.roomName).emit("group message", data)
    });

    socket.on("disconnect", () => {
      console.log("disconnect");
      this.io.emit("user disconnected");
    });
  }

  private joinRoom(socket: socketio.Socket, roomName: string) {
    console.log("join raum", roomName);

    if (!this.doesRoomExist(roomName)) {
      this.addRoomToDirectory({ name: roomName });
    }
    
    socket.join(roomName);
    const response: GroupMessage = { msg: { msg: 'user joined' }, roomName };
    this.io.to(roomName).emit("group message", response);
  }

  private exitRoom(socket: socketio.Socket, roomName: string) {
    console.log("exit raum", roomName);

    if (!this.doesRoomExist(roomName)) {
      return;
    }
    
    const response: GroupMessage = { msg: { msg: 'user left' }, roomName };
    this.io.to(roomName).emit("group message", response)
    socket.leave(roomName);
  }

  private addRoomToDirectory(room: Room) {
    this.publicRooms.push(room);
  }

  private doesRoomExist(roomName: string) {
    return this.publicRooms.filter(r => r.name === roomName).length > 0;
  }
}
