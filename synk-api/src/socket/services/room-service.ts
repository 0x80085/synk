import * as socketio from 'socket.io';

import { Room } from '../models/room';
import { IncomingGroupMessage, MediaEvent } from '../models/message';
import { SocketPassport } from '../models/socket.passport';
import { ItemContent } from '../models/playlist-item';
import { Logger } from '../../tools/logger';

export enum Commands {
  PM = 'private message',
  JOIN_ROOM = 'join room',
  EXIT_ROOM = 'exit room',
  GROUP_MESSAGE = 'group message',
  MEDIA_EVENT = 'media event',
  ADD_MEDIA = 'add media',
  REMOVE_MEDIA = 'remove media',
  GIVE_LEADER = 'give leader',
  DISCONNECT = 'disconnect'
}

export class RoomService {
  private io: socketio.Server;

  public publicRooms: Room[] = [];
  private logger: Logger;

  constructor(sio: socketio.Server, logger: Logger) {
    this.io = sio;
    this.logger = logger;
  }

  registerCommands = (socket: SocketPassport, next: (err?: any) => void) => {
    this.setupCommandHandlers(socket);
    next();
  }

  private setupCommandHandlers(socket: SocketPassport) {
    socket.on(Commands.JOIN_ROOM, (roomName: string) => {
      try {
        this.joinRoom(socket, roomName);
      } catch (error) {
        this.logger.info(error);
      }
    });

    socket.on(Commands.EXIT_ROOM, (roomName: string) => {
      try {
        this.exitRoom(socket, roomName);
      } catch (error) {
        this.logger.info(error);
      }
    });

    socket.on(Commands.GROUP_MESSAGE, (data: IncomingGroupMessage) =>
      this.onGroupMessage(data, socket));

    socket.on(Commands.MEDIA_EVENT, (data: MediaEvent) => {
      try {

        if (!this.getRoomByName(data.roomName)) {
          console.log('doIfRoomExists.. ROOM does not exist!');
          return;
        }
        this.onMediaEvent(data, socket);

      } catch (error) {
        this.logger.info('onMediaEvent failed');
        this.logger.info('broken data:');
        this.logger.info(data);
        this.logger.error(error);
      }
    });

    socket.on(Commands.ADD_MEDIA, (data: MediaEvent) => {
      try {
        this.onAddMedia(data);
      } catch (error) {
        this.logger.info('onAddMedia failed');
        this.logger.info('broken data:');
        this.logger.info(data);
        this.logger.error(error);
      }
    });

    socket.on(Commands.REMOVE_MEDIA, (data: MediaEvent) => {
      try {
        this.onRemoveMedia(data);
      } catch (error) {
        this.logger.info('onAddMedia failed');
        this.logger.info('broken data:');
        this.logger.info(data);
        this.logger.error(error);
      }
    });

    socket.on(Commands.GIVE_LEADER, (data: { to: string, roomName: string }) => {
      try {
        this.onGiveLeader(data, socket);
      } catch (error) {
        this.logger.info('GIVE_LEADER failed');
        this.logger.info('broken data:');
        this.logger.info(data);
        this.logger.error(error);
      }
    });

    socket.on(Commands.DISCONNECT, this.disconnect);
  }

  createRoom(data: { name: string; description: string }, creator: string) {
    const newRoom = new Room(data.name, this.io, this.logger, null);
    newRoom.description = data.description;
    newRoom.creator = creator;

    this.addRoomToDirectory(newRoom);
  }

  deleteRoom(name: string, creator: string) {
    const room = this.getRoomByName(name);
    if (!room) {
      return;
    }
    if (room.creator !== creator) {
      return;
    }
    this.removeRoomfromDirectory(room);
  }

  addMediaToPlaylist(data: MediaEvent) {
    this.onAddMedia(data);
  }

  private joinRoom(socket: socketio.Socket, roomName: string) {
    const room = this.getRoomByName(roomName);

    if (!room) {
      // Todo - instead f creatun, check DB and throw if not in DB
      const newRoom = new Room(roomName, this.io, this.logger, socket);
      this.addRoomToDirectory(newRoom);
      newRoom.join(socket);
      return;
    }

    room.join(socket);
  }

  private onMediaEvent = (data: MediaEvent, socket: SocketPassport) => {

    const afterPlaylistUpdate = (state: ItemContent) => {
      const update: MediaEvent = {
        ...state,
        roomName: data.roomName,
        currentTime: data.currentTime
      };
      this.io.to(data.roomName).emit('media event', update);
    };

    const room = this.getRoomByName(data.roomName);
    if (!room) {
      return Error('Room non-existant');
    }
    const isLeader =
      room.leader && room.leader.userName === socket.request.user.username;

    if (isLeader) {
      room.currentPlayList.handleListUpdate(data, afterPlaylistUpdate);
      room.broadcastPlaylistToAll();
    }
  }

  private onAddMedia = (data: MediaEvent) => {
    const room = this.getRoomByName(data.roomName);
    if (!room) {
      return Error('Room non-existant');
    }
    room.currentPlayList.add({ ...data },
      () => room.broadcastPlaylistToAll()
    );
  }

  private onRemoveMedia = (data: MediaEvent) => {
    const room = this.getRoomByName(data.roomName);
    if (!room) {
      return Error('Room non-existant');
    }
    room.currentPlayList.remove(data.mediaUrl);
    room.broadcastPlaylistToAll();
  }

  private onGroupMessage = (
    data: IncomingGroupMessage,
    socket: SocketPassport
  ) => {
    const room = this.getRoomByName(data.roomName);

    if (!room) {
      return Error('Room non-existant');
    }

    room.broadcastMessageToAll(socket, data);
  }

  private onGiveLeader = (
    { to, roomName }: { to: string, roomName: string },
    socket: SocketPassport) => {
    const room = this.getRoomByName(roomName);
    if (room) {
      room.giveLeader(socket, to);
    }
  }

  private disconnect = (socket: SocketPassport) => {
    if (socket.request && socket.request.user) {
      // TODO: Improve performance
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
    this.publicRooms.push(room);
  }

  private removeRoomfromDirectory(room: Room) {
    this.publicRooms = this.publicRooms.filter(r => r.name !== room.name);
  }

  private getRoomByName(roomName: string) {
    return this.publicRooms.find(r => r.name === roomName);
  }
}
