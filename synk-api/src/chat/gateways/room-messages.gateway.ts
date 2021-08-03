import { Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException
} from '@nestjs/websockets';
import { from } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as socketio from 'socket.io';

import { Roles } from '../../domain/entity';
import { AddMediaToRoomCommand } from '../models/commands/add-media-to-room.command';
import { getMemberSummary } from '../models/member/member.representation';
import { toRepresentation } from '../models/playlist/playlist.representation';
import { Room } from '../models/room/room';
import { ConnectionTrackingService } from '../services/connection-tracking.service';
import { RoomService } from '../services/room.service';
import { MessageTypes } from './message-types.enum';
import { SOCKET_IO_CONFIG } from './socketio.config';

@WebSocketGateway(SOCKET_IO_CONFIG)
export class RoomMessagesGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  private readonly logger = new Logger(RoomMessagesGateway.name);

  @WebSocketServer()
  server: socketio.Server;

  constructor(
    private roomService: RoomService,
    private tracker: ConnectionTrackingService,
    private commandBus: CommandBus,
  ) { }

  handleConnection(client: socketio.Socket) {
    try {
      this.tracker.trackMemberConnection(client);
    } catch (error) {
      this.logger.log(error);
      this.logger.log(`^^^ Failed to handleConnection from [${this.tracker.getIpFromSocket(client)}]`);
      client.disconnect();
    }
  }

  handleDisconnect(client: socketio.Socket) {
    try {
      console.log('handleDisconnect for ' + client.handshake.address);
      const memberId = (client.handshake as any).session.passport.user.id;

      this.tracker.getMemberBySocket(client)
        .then(member => { this.logger.log(` -> handleDisconnect for  ${memberId}`); return member })
        .then(member => ({ connections: this.tracker.memberInRoomTracker.get(member.id), member }))
        .then(({ connections, member }) => (connections || [] as {
          roomId: string;
          socketId: string;
        }[])
          .filter((conn) => conn.socketId === client.id)
          .forEach(connection => {
            console.log(connection);

            this.roomService.leaveRoom(connection.roomId, member)
          }))
        .then(() => client.leaveAll())
        .then(() => this.tracker.memberDisconnects(client))
        .catch(console.log)

    } catch (error) {
      console.log(error);
    }
  }

  afterInit(server: socketio.Server) {
    this.logger.log('WS server started');
  }

  @SubscribeMessage(MessageTypes.GROUP_MESSAGE)
  async handleMessage(client: socketio.Socket, { roomName, content }: { roomName: string, content: { text: string } }) {
    const member = await this.tracker.getMemberBySocket(client);

    const room = this.roomService.getRoomByName(roomName);
    room.addMessage(member, content.text);

    this.broadcastGroupMessageToRoom(room);
  }

  @SubscribeMessage(MessageTypes.MEDIA_EVENT)
  async handleUpdateNowPlaying(client: socketio.Socket, { roomName, currentTime: time, mediaUrl: url }: { roomName: string, mediaUrl: string, currentTime: any }) {
    const room = this.roomService.getRoomByName(roomName);
    const member = await this.tracker.getMemberBySocket(client);

    room.updateNowPlaying(member, { time, url });

    this.broadcastNowPlayingToRoom(room);
    this.broadcastPlaylistToRoom(room);
  }

  @SubscribeMessage(MessageTypes.JOIN_ROOM)
  async handleJoinRoom(client: socketio.Socket, name: string) {
    const room = this.roomService.getRoomByName(name)

    this.logger.log("handleJoinRoom")

    if (this.tracker.isClientInRoom(client, room.id)) {
      console.log(this.tracker.memberInRoomTracker);

      throw new WsException(MessageTypes.ALREADY_JOINED);
    }

    const member = await this.tracker.getMemberBySocket(client);
    try {

      room.enter(member);
      client.join(room.id);

      this.tracker.memberJoinsRoom(client, room.id)

      this.logger.log(`${client.id} ${room.id}`);
      this.logger.log(`${client.rooms}`);


      this.broadcastMemberlistToRoom(room);
      this.broadcastGroupMessageToRoom(room);

      this.sendRoomConfigToMember(room, member.id, client);
      this.sendPlaylistToMember(room, client);

    } catch (error) {
      if (error.message === MessageTypes.ALREADY_JOINED) {
        throw new WsException(MessageTypes.ALREADY_JOINED);
      } else {
        throw new WsException(MessageTypes.GENERIC_ERROR);
      }
    }
  }

  @SubscribeMessage(MessageTypes.EXIT_ROOM)
  async handleLeaveRoom(client: socketio.Socket, name: string) {
    this.logger.log('handleLeaveRoom');

    const member = await this.tracker.getMemberBySocket(client)
    const room = this.roomService.getRoomByName(name);

    if (this.tracker.isClientInRoom(client, room.id)) {
      const newLeader = room.leave(member);
      client.leave(room.id);

      this.tracker.memberLeavesRoom(client, room.id);

      if (newLeader) {
        this.sendRoomConfigToMember(room, newLeader.id, this.tracker.getSocketByMemberId(newLeader.id));
      }

      this.broadcastMemberlistToRoom(room);
      this.broadcastGroupMessageToRoom(room);
      this.logger.log(`handleLeaveRoom - client left`);
    } else {
      this.logger.log(`handleLeaveRoom - noop no user was connected in that room`);
    }
  }

  @SubscribeMessage(MessageTypes.VOTE_SKIP)
  async handleVoteSkip(client: socketio.Socket, name: string) {
    this.logger.log('handleVoteSkip');

    const member = await this.tracker.getMemberBySocket(client);
    const room = this.roomService.getRoomByName(name);

    if (room.members.indexOf(member) != -1) {
      room.voteSkip(member);
      this.broadcastVoteSkipResultsToRoom(room);
    }
  }


  @SubscribeMessage(MessageTypes.GIVE_LEADER)
  async handleGiveLeader(requestingMemberSocket: socketio.Socket, { to, roomName }: { to: string, roomName: string }) {
    this.logger.log('handleGiveLeader');

    try {
      // TODO move this logic somewhere else model or/and service  
      const requestingMember = await this.tracker.getMemberBySocket(requestingMemberSocket);
      const room = this.roomService.getRoomByName(roomName);

      const newLeader = await this.roomService.giveLeader(room.id, requestingMember, to);

      const newLeaderSocket = await this.tracker.getSocketByMemberId(newLeader.id);
      this.sendRoomConfigToMember(room, newLeader.id, newLeaderSocket);
      this.sendRoomConfigToMember(room, requestingMember.id, requestingMemberSocket);

      this.broadcastMemberlistToRoom(room);

    } catch (error) {
      this.logger.error(error)

      if (error.message === "Forbidden") {
        throw new WsException(MessageTypes.FORBIDDEN)
      }
      throw new WsException(MessageTypes.GENERIC_ERROR)
    }

  }

  @SubscribeMessage(MessageTypes.ADD_MEDIA)
  handleAddMedia(client: socketio.Socket, { roomName, mediaUrl }: { roomName: string, mediaUrl: string }) {
    this.logger.log('handleAddMedia');

    return from(this.tracker.getMemberBySocket(client)).pipe(
      map(member => ({ member, room: this.roomService.getRoomByName(roomName) })),
      switchMap(({ member, room }) =>
        from(this.commandBus.execute<AddMediaToRoomCommand>(new AddMediaToRoomCommand(mediaUrl, member, room, client, this.server))).pipe(
          catchError(e => {
            throw new WsException(e.message);
          })
        )));
  }

  @SubscribeMessage(MessageTypes.REMOVE_MEDIA)
  async handleRemoveMedia(client: socketio.Socket, { roomName, mediaUrl }: { roomName: string, mediaUrl: string }) {
    this.logger.log('handelRemoveMedia');

    return from(this.tracker.getMemberBySocket(client)).pipe(
      map(member => ({ member, room: this.roomService.getRoomByName(roomName) })),
      tap(({ room, member }) => room.removeMediaFromPlaylist(member, mediaUrl)),
      tap(({ room }) => this.broadcastPlaylistToRoom(room)),
      tap(_ => client.emit(MessageTypes.REMOVE_MEDIA_SUCCESS, mediaUrl)),
      catchError(e => {
        if (e.message === 'Forbidden') { throw new WsException(MessageTypes.FORBIDDEN); }
        throw new WsException(MessageTypes.GENERIC_ERROR);
      })
    )
  }

  @SubscribeMessage(MessageTypes.CHANGE_MEDIA_POSITION_IN_LIST)
  async handleChangeMediaPositionInList(client: socketio.Socket, { roomName, mediaUrl, newPosition }: { roomName: string, mediaUrl: string, newPosition: number }) {
    this.logger.log('handelRemoveMedia');

    return from(this.tracker.getMemberBySocket(client)).pipe(
      map(member => ({ member, room: this.roomService.getRoomByName(roomName) })),
      tap(({ room, member }) => room.moveMediaPositionInPlaylist(member, mediaUrl, newPosition)),
      tap(({ room }) => this.broadcastPlaylistToRoom(room)),
      tap(_ => client.emit(MessageTypes.REPOSITION_MEDIA_SUCCESS, mediaUrl)),
      catchError(e => {
        if (e.message === 'Forbidden') { throw new WsException(MessageTypes.FORBIDDEN); }
        throw new WsException(MessageTypes.GENERIC_ERROR);
      })
    )
  }

  private broadcastMemberlistToRoom(room: Room) {
    const list = room.members.map(m => getMemberSummary(m, room));

    this.server.in(room.id).emit(MessageTypes.MEMBERLIST_UPDATE, list);
  }

  private broadcastPlaylistToRoom(room: Room) {
    const playlist = toRepresentation(room.currentPlaylist);
    this.server.in(room.id).emit(MessageTypes.PLAYLIST_UPDATE, playlist);
  }

  private broadcastGroupMessageToRoom(room: Room) {
    const lastMessages = room.messages.queue.toArray()
      .map((msg) => ({
        username: msg.author.username,
        text: msg.displayText
      }));
    this.server.in(room.id).emit(MessageTypes.GROUP_MESSAGE, lastMessages);
  }

  private broadcastNowPlayingToRoom(room: Room) {
    const mediaEvent = {
      mediaUrl: room.currentPlaylist.nowPlaying().media.url,
      currentTime: room.currentPlaylist.nowPlaying().time
    }
    this.server.in(room.id).emit(MessageTypes.MEDIA_EVENT, mediaEvent);
  }

  private broadcastVoteSkipResultsToRoom(room: Room) {
    this.server.in(room.id).emit(MessageTypes.VOTE_SKIP, room.currentPlaylist.voteSkipCount);
  }

  private sendRoomConfigToMember(room: Room, memberId: string, client: socketio.Socket) {
    const moderator = room.moderators.find(mod => mod.member.id === memberId);
    const role = !!moderator
      ? Roles.moderator
      : room.owner.id === memberId
        ? Roles.admin
        : Roles.member

    const config = {
      isLeader: room.leader.id === memberId,
      isOwner: room.owner.id === memberId,
      permissionLevel: moderator?.level || 0,
      role
    };

    client.emit(MessageTypes.USER_CONFIG, config);
  }

  private sendPlaylistToMember(room: Room, client: socketio.Socket) {
    const playlist = toRepresentation(room.currentPlaylist);
    client.emit(MessageTypes.PLAYLIST_UPDATE, playlist);
  }
}
