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
import { from, Subscription } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Socket, Server } from 'socket.io';

import { Member, Roles } from '../../domain/entity';
import { AutomatedRoom } from '../models/automated-room/automated-room';
import { AddMediaToRoomCommand } from '../models/commands/add-media-to-room.command';
import { Media } from '../models/media/media';
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
  server: Server;

  broadcastToAutomatedRoomSubscriptions: Subscription[];

  constructor(
    private roomService: RoomService,
    private tracker: ConnectionTrackingService,
    private commandBus: CommandBus,
  ) { }

  handleConnection(client:  Socket) {
    try {
      this.tracker.trackMemberConnection(client);
    } catch (error) {
      this.logger.log(error);
      this.logger.log(`^^^ Failed to handleConnection from [${this.tracker.getIpFromSocket(client)}]`);
      client.disconnect();
    }
  }

  handleDisconnect(client:  Socket) {
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
            const room = this.roomService.getRoomById(connection.roomId);
            room.leave(member);
            this.broadcastMemberlistToRoom(room);
          }))
        .then(() => Object.keys(client.rooms).forEach(roomId => client.leave(roomId)))
        .then(() => this.tracker.memberDisconnects(client))
        .catch(console.log)

    } catch (error) {
      console.log(error);
    }
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  afterInit(server:  Server) {
    this.logger.log('WS server started');
    this.logger.log('Now starting the automated room nowPlaying subscriptions..');
    this.listenForAutomatedRoomUpdates();
    this.logger.log('Automated room nowPlaying subscriptions have started.');
  }

  @SubscribeMessage(MessageTypes.GROUP_MESSAGE)
  async handleMessage(client: Socket, { roomName, content }: { roomName: string, content: { text: string } }) {
    const member = await this.tracker.getMemberBySocket(client);

    const automatedRoom = this.roomService.getAutomatedRoom(roomName);

    if (automatedRoom) {
      automatedRoom.addMessage(member, content.text);
      this.broadcastGroupMessageToRoom(automatedRoom);

    } else {

      const room = this.roomService.getRoomByName(roomName);
      room.addMessage(member, content.text);
      this.broadcastGroupMessageToRoom(room);
    }

  }

  @SubscribeMessage(MessageTypes.MEDIA_EVENT)
  async handleUpdateNowPlaying(client:  Socket, { roomName, currentTime: time, mediaUrl: url }: { roomName: string, mediaUrl: string, currentTime: any }) {
    const room = this.roomService.getRoomByName(roomName);
    const member = await this.tracker.getMemberBySocket(client);

    const { hasChangedMediaUrl } = room.updateNowPlaying(member, { time, url });

    if (hasChangedMediaUrl) {
      
      this.broadcastVoteSkipResultsToRoom(room);
    }
    this.broadcastNowPlayingToRoom(room);

  }

  @SubscribeMessage(MessageTypes.JOIN_ROOM)
  async handleJoinRoom(client:  Socket, name: string) {

    const automatedRoom = this.roomService.getAutomatedRoom(name);

    if (automatedRoom) {

      this.logger.log("handleJoinRoom - Automated")

      if (this.tracker.isClientInRoom(client, automatedRoom.id)) {
        return; // for now
      }

      const member = await this.tracker.getMemberBySocket(client);
      try {

        this.joinAutomatedRoom(automatedRoom, member, client);

      } catch (error) {
        if (error.message === MessageTypes.ALREADY_JOINED) {
          throw new WsException(MessageTypes.ALREADY_JOINED);
        } else {
          throw new WsException(MessageTypes.GENERIC_ERROR);
        }
      }

    } else {

      const room = this.roomService.getRoomByName(name)

      this.logger.log("handleJoinRoom")

      if (this.tracker.isClientInRoom(client, room.id)) {
        throw new WsException(MessageTypes.ALREADY_JOINED);
      }

      const member = await this.tracker.getMemberBySocket(client);
      try {

        this.joinCommunityRoom(room, member, client);

      } catch (error) {
        if (error.message === MessageTypes.ALREADY_JOINED) {
          throw new WsException(MessageTypes.ALREADY_JOINED);
        } else {
          throw new WsException(MessageTypes.GENERIC_ERROR);
        }
      }
    }
  }

  @SubscribeMessage(MessageTypes.EXIT_ROOM)
  async handleLeaveRoom(client:  Socket, name: string) {
    this.logger.log('handleLeaveRoom');

    const member = await this.tracker.getMemberBySocket(client)

    const automatedRoom = this.roomService.getAutomatedRoom(name);

    if (automatedRoom) {
      this.leaveAutomatedRoom(client, automatedRoom, member);

    } else {
      this.leaveCommunityRoom(name, client, member);
    }
  }

  @SubscribeMessage(MessageTypes.VOTE_SKIP)
  async handleVoteSkip(client:  Socket, name: string) {
    this.logger.log('handleVoteSkip');

    const member = await this.tracker.getMemberBySocket(client);

    const automatedRoom = this.roomService.getAutomatedRoom(name);
    const room = this.roomService.getAutomatedRoom(name)
      ?? this.roomService.getRoomByName(name);

    if (automatedRoom) {
      automatedRoom.voteSkip(member);
      this.broadcastVoteSkipResultsToRoom(automatedRoom);
    } else if (room) {
      room.voteSkip(member);
      this.broadcastVoteSkipResultsToRoom(room);

    }
  }

  // @SubscribeMessage(MessageTypes.UPDATE_VOTE_SKIP_RATIO)
  // async handleUpdateVoteSkipRatio(client: Socket, { name, ratio }: { name: string, ratio: number }) {
  //   this.logger.log('handleUpdateVoteSkipRatio');

  //   const member = await this.tracker.getMemberBySocket(client);

  //   const automatedRoom = this.roomService.getAutomatedRoom(name);
  //   const room = this.roomService.getAutomatedRoom(name)
  //     ?? this.roomService.getRoomByName(name);

  //   if (automatedRoom) {
  //     throw new WsException(MessageTypes.GENERIC_ERROR);
  //   } else if (room as Room) {
  //     (room as Room).updateVoteSkipRatio(member, ratio);
  //     this.broadcastVoteSkipResultsToRoom(room);

  //   }
  // }

  @SubscribeMessage(MessageTypes.GIVE_LEADER)
  async handleGiveLeader(requestingMemberSocket:  Socket, { to, roomName }: { to: string, roomName: string }) {
    this.logger.log('handleGiveLeader');

    try {
      // TODO move this logic somewhere else model or/and service  
      const room = this.roomService.getRoomByName(roomName);

      const requestingMember = await this.tracker.getMemberBySocket(requestingMemberSocket);
      const newLeader = await this.roomService.giveLeader(room.id, requestingMember, to);
      const newLeaderSocket = await this.tracker.getSocketByMemberId(newLeader.id);

      this.sendRoomConfigToMember(room, newLeader.id, newLeaderSocket);
      this.sendRoomConfigToMember(room, requestingMember.id, requestingMemberSocket);
      newLeaderSocket.emit(MessageTypes.YOU_ARE_LEADER);
      requestingMemberSocket.emit(MessageTypes.LEADER_ROLE_PASSED_ON_SUCCESS);

      this.broadcastMemberlistToRoom(room);
      this.broadcastGroupMessageToRoom(room);

    } catch (error) {
      this.logger.error(error)

      if (error.message === "Forbidden") {
        throw new WsException(MessageTypes.FORBIDDEN)
      }
      throw new WsException(MessageTypes.GENERIC_ERROR)
    }

  }

  @SubscribeMessage(MessageTypes.ADD_MEDIA)
  handleAddMedia(client:  Socket, { roomName, mediaUrl }: { roomName: string, mediaUrl: string }) {
    this.logger.log('handleAddMedia');

    return from(this.tracker.getMemberBySocket(client)).pipe(
      map(member => ({ member, room: this.roomService.getRoomByName(roomName) })),
      switchMap(({ member, room }) =>
        from(this.commandBus.execute<AddMediaToRoomCommand>(new AddMediaToRoomCommand(mediaUrl, member, room, client, this.server))).pipe(
          tap(({ room }) => this.broadcastGroupMessageToRoom(room)),
          catchError(e => {
            throw new WsException(e.message);
          })
        )));
  }

  @SubscribeMessage(MessageTypes.REMOVE_MEDIA)
  async handleRemoveMedia(client:  Socket, { roomName, mediaUrl }: { roomName: string, mediaUrl: string }) {
    this.logger.log('handelRemoveMedia');

    return from(this.tracker.getMemberBySocket(client)).pipe(
      map(member => ({ member, room: this.roomService.getAutomatedRoom(roomName) || this.roomService.getRoomByName(roomName) })),
      tap(({ room, member }) => room.removeMediaFromPlaylist(member, mediaUrl)),
      tap(({ room }) => this.broadcastPlaylistToRoom(room)),
      tap(({ room }) => this.broadcastGroupMessageToRoom(room)),
      tap(_ => client.emit(MessageTypes.REMOVE_MEDIA_SUCCESS, mediaUrl)),
      catchError(e => {
        if (e.message === 'Forbidden') { throw new WsException(MessageTypes.FORBIDDEN); }
        throw new WsException(MessageTypes.GENERIC_ERROR);
      })
    )
  }

  @SubscribeMessage(MessageTypes.CHANGE_MEDIA_POSITION_IN_LIST)
  async handleChangeMediaPositionInList(client:  Socket, { roomName, mediaUrl, newPosition }: { roomName: string, mediaUrl: string, newPosition: number }) {
    this.logger.log('handleChangeMediaPositionInList');

    return from(this.tracker.getMemberBySocket(client)).pipe(
      map(member => ({ member, room: this.roomService.getRoomByName(roomName) })),
      tap(({ room, member }) => room.moveMediaPositionInPlaylist(member, mediaUrl, newPosition)),
      tap(({ room }) => this.broadcastPlaylistToRoom(room)),
      tap(({ room }) => this.broadcastGroupMessageToRoom(room)),
      tap(_ => client.emit(MessageTypes.REPOSITION_MEDIA_SUCCESS, mediaUrl)),
      catchError(e => {
        if (e.message === 'Forbidden') { throw new WsException(MessageTypes.FORBIDDEN); }
        throw new WsException(MessageTypes.GENERIC_ERROR);
      })
    )
  }

  @SubscribeMessage(MessageTypes.MEDIA_NOT_PLAYBLE)
  async handleVideoNotPlayable(client:  Socket, { roomName, mediaUrl }: { roomName: string, mediaUrl: string }) {
    this.logger.log('handleVideoNotPlayable');

    return from(this.tracker.getMemberBySocket(client)).pipe(
      map(member => (
        {
          member,
          room: this.roomService.getRoomByName(roomName),
          automatedroom: this.roomService.getAutomatedRoom(roomName)
        })),
      map(({ room, automatedroom }) => ({
        target: room
          ? room.currentPlaylist?.selectFromQueue(mediaUrl)
          : automatedroom?.currentPlaylist?.selectFromQueue(mediaUrl),
        room,
        automatedroom
      })),
      tap(({ target: { media }, room, automatedroom }) =>
        // todo community room should tell it's leader to play diff video
        room
          ? room.currentPlaylist?.remove(media)
          : automatedroom?.handleUnplayableMedia(media)),
      tap(({ room, automatedroom }) =>
        room
          ? this.broadcastPlaylistToRoom(room)
          : this.broadcastPlaylistToRoom(automatedroom)),
      tap(_ => client.emit(MessageTypes.REMOVE_MEDIA_SUCCESS, mediaUrl)),
      catchError(e => {
        if (e.message === 'Forbidden') { throw new WsException(MessageTypes.FORBIDDEN); }
        throw new WsException(MessageTypes.GENERIC_ERROR);
      })
    )
  }

  private broadcastMemberlistToRoom(room: Room | AutomatedRoom) {
    const list = room.members.map(m => getMemberSummary(m, room));

    this.server.in(room.id).emit(MessageTypes.MEMBERLIST_UPDATE, list);
  }

  private broadcastPlaylistToRoom(room: Room | AutomatedRoom) {
    const playlist = toRepresentation(room.currentPlaylist);
    this.server.in(room.id).emit(MessageTypes.PLAYLIST_UPDATE, playlist);
  }

  private broadcastGroupMessageToRoom(room: Room | AutomatedRoom) {
    const lastMessages = room.messages.queue.toArray()
      .map((msg) => ({
        username: msg.author.username,
        text: msg.displayText,
        isSystemMessage: msg.isSystemMessage
      }));
    this.server.in(room.id).emit(MessageTypes.GROUP_MESSAGE, lastMessages);
  }

  private broadcastNowPlayingToRoom(room: Room) {
    const mediaEvent = {
      mediaUrl: room.currentPlaylist.nowPlaying()?.media?.url,
      currentTime: room.currentPlaylist.nowPlaying().time
    }
    this.server.in(room.id).emit(MessageTypes.MEDIA_EVENT, mediaEvent);
  }

  private broadcastVoteSkipResultsToRoom(room: Room | AutomatedRoom) {
    this.server.in(room.id).emit(MessageTypes.VOTE_SKIP_COUNT, { count: room.voteSkipCount, max: room.votesNeededForSkip });
  }

  private sendRoomConfigToMember(room: Room | AutomatedRoom, memberId: string, client:  Socket, isAutomatedChannel = false) {

    if (isAutomatedChannel) {
      client.emit(MessageTypes.USER_CONFIG, {
        isLeader: false,
        isOwner: false,
        permissionLevel: 0,
        role: Roles.member,
        isAutomatedChannel: true
      });
    } else {
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
        role,
        isAutomatedChannel: false
      };

      client.emit(MessageTypes.USER_CONFIG, config);
    }

  }

  private sendPlaylistToMember(room: Room | AutomatedRoom, client:  Socket) {
    const playlist = toRepresentation(room.currentPlaylist);
    client.emit(MessageTypes.PLAYLIST_UPDATE, playlist);
  }

  private listenForAutomatedRoomUpdates() {
    this.broadcastToAutomatedRoomSubscriptions = this.roomService.automatedRooms.map(room => {
      return room.nowPlayingSubject
        .pipe(
          tap(update => this.broadcastNowPlayingToAutonomousRoom(room.id, update))
        ).subscribe()
    })
  }

  private broadcastNowPlayingToAutonomousRoom(roomId: string, { media, time }: { media: Media; time: number; }): void {
    const mediaEvent = {
      mediaUrl: media.url,
      currentTime: time
    }
    this.server.in(roomId).emit(MessageTypes.MEDIA_EVENT, mediaEvent);
  }

  private leaveCommunityRoom(name: string, client:  Socket, member: Member) {
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
      this.broadcastVoteSkipResultsToRoom(room);
      this.logger.log(`handleLeaveRoom - client left`);
    } else {
      this.logger.log(`handleLeaveRoom - noop no user was connected in that room`);
    }
  }

  private leaveAutomatedRoom(client:  Socket, automatedRoom: AutomatedRoom, member: Member) {
    if (this.tracker.isClientInRoom(client, automatedRoom.id)) {

      automatedRoom.leave(member);
      client.leave(automatedRoom.id);
      this.tracker.memberLeavesRoom(client, automatedRoom.id);

      this.broadcastMemberlistToRoom(automatedRoom);
      this.broadcastGroupMessageToRoom(automatedRoom);
      this.broadcastVoteSkipResultsToRoom(automatedRoom);
      this.logger.log(`handleLeaveRoom - client left`);

    } else {
      this.logger.log(`handleLeaveRoom - noop no user was connected in that automated room`);
    }
  }

  private joinCommunityRoom(room: Room, member: Member, client:  Socket) {
    room.enter(member);
    client.join(room.id);

    this.tracker.memberJoinsRoom(client, room.id);

    this.broadcastMemberlistToRoom(room);
    this.broadcastGroupMessageToRoom(room);
    this.broadcastVoteSkipResultsToRoom(room);

    this.sendRoomConfigToMember(room, member.id, client);
    this.sendPlaylistToMember(room, client);

    this.logger.log(`[${member.username}] joined [${room.name}]`)
  }

  private joinAutomatedRoom(automatedRoom: AutomatedRoom, member: Member, client:  Socket) {
    automatedRoom.enter(member);
    client.join(automatedRoom.id);

    this.tracker.memberJoinsRoom(client, automatedRoom.id);

    this.broadcastMemberlistToRoom(automatedRoom);
    this.broadcastGroupMessageToRoom(automatedRoom);
    this.broadcastVoteSkipResultsToRoom(automatedRoom);

    this.sendRoomConfigToMember(automatedRoom, member.id, client, true);
    this.sendPlaylistToMember(automatedRoom, client);

    this.logger.log(`[${member.username}] joined [${automatedRoom.name}]`)
  }

}
