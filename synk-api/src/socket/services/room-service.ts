import * as socketio from 'socket.io';

import { Room } from '../models/room';
import { IncomingGroupMessage, MediaEvent } from '../models/message';
import { MediaContent } from '../models/playlist';
import { SocketPassport } from '../models/socket.passport';

export enum Commands {
  PM = 'private message',
  JOIN_ROOM = 'join room',
  EXIT_ROOM = 'exit room',
  GROUP_MESSAGE = 'group message',
  MEDIA_EVENT = 'media event',
  ADD_MEDIA = 'add media',
  DISCONNECT = 'disconnect'
}

export class RoomService {
  private io: socketio.Server;

  public publicRooms: Room[] = [];

  constructor(sio: socketio.Server) {
    this.io = sio;

    const defaultRoom = new Room('SNKD', this.io, null);
    this.publicRooms.push(defaultRoom);
  }

  registerCommands = (socket: SocketPassport, next: (err?: any) => void) => {
    this.setupCommandHandlers(socket);
    next();
  }

  private setupCommandHandlers(socket: SocketPassport) {
    socket.on(Commands.JOIN_ROOM, (roomName: string) => {
      try {
        console.log('socket.on(Commands.JOIN_ROOM');

        this.joinRoom(socket, roomName);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on(Commands.EXIT_ROOM, (roomName: string) => {
      try {

        this.exitRoom(socket, roomName);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on(Commands.GROUP_MESSAGE, (data: IncomingGroupMessage) =>
      this.onGroupMessage(data, socket));

    socket.on(Commands.MEDIA_EVENT, (data: MediaEvent) =>
      this.onMediaEvent(data, socket)
    );

    socket.on(Commands.ADD_MEDIA, (data: MediaEvent) =>
      this.onAddMedia(data, socket)
    );

    socket.on(Commands.DISCONNECT, this.disconnect);
  }

  createRoom(data: { name: string; description: string }) {
    const newRoom = new Room(data.name, this.io, null);
    newRoom.description = data.description;

    this.addRoomToDirectory(newRoom);
  }

  private joinRoom(socket: socketio.Socket, roomName: string) {
    const room = this.getRoomByName(roomName);

    if (!room) {
      const newRoom = new Room(roomName, this.io, socket);
      this.addRoomToDirectory(newRoom);
      newRoom.join(socket);
      return;
    }

    room.join(socket);
  }

  private onMediaEvent = (data: MediaEvent, socket: SocketPassport) => {
    console.log('media event received', data.currentTime);

    const afterPlaylistUpdate = (state: MediaContent) => {
      const update: MediaEvent = {
        ...state,
        roomName: data.roomName,
        currentTime: data.currentTime
      };
      console.log('## UPDATE', update);
      this.io.to(data.roomName).emit('media event', update);
    };

    const room = this.getRoomByName(data.roomName);
    const isLeader =
      room.leader && room.leader.userName === socket.request.user.username;

    if (isLeader) {
      room.currentPlayList.handleListUpdate(data, afterPlaylistUpdate);
    }
  }

  private onAddMedia = (data: MediaEvent, socket: SocketPassport) => {
    console.log('add media received', data.currentTime);

    const room = this.getRoomByName(data.roomName);
    room.currentPlayList.add({
      ...data,
      isPermenant: false,
      addedByUsername: socket.request.user.username
    });

    // this.io.to(data.roomName).emit("playlist update", update);
  }

  private onGroupMessage = (
    data: IncomingGroupMessage,
    socket: SocketPassport
  ) => {
    const room = this.getRoomByName(data.roomName);

    if (!room) {
      return Error('Room non-existant');
    }

    room.sendMessageToRoom(socket, data);
  }

  private disconnect = (socket: SocketPassport) => {
    if (socket.request && socket.request.user) {
      // Can be done better? idk
      this.publicRooms.forEach(room => room.exit(socket));
    }
  }

  private exitRoom(socket: socketio.Socket, roomName: string) {
    const room = this.getRoomByName(roomName);

    if (!room) {
      return Error('Room non-existant');
    }

    room.exit(socket);
  }

  private addRoomToDirectory(room: Room) {
    if (this.getRoomByName(room.name)) {
      console.log('##### ERR ROOM ALREADY EXiSTS');
      throw Error('Room already exists');
    }
    this.publicRooms.push(room);
  }

  private getRoomByName(roomName: string) {
    return this.publicRooms.find(r => r.name === roomName);
  }
}
