import * as socketio from 'socket.io';

import { RoomMember, RoomMemberConfig, Roles, RoomMemberDto } from './user';
import {
  OutgoingGroupMessage,
  IncomingGroupMessage,
  MediaEvent
} from './message';
import { Playlist } from './playlist';
import { Logger } from '../../tools/logger';
import { getUsername } from './socket.passport';

export class Room {
  id: string;
  name: string;
  description: string;
  creator: string;

  leader: RoomMember = null;
  members: RoomMember[] = [];

  playlists: Playlist[] = [];
  currentPlayList: Playlist | null = null;

  private io: socketio.Server;
  logger: Logger;

  constructor(
    name: string,
    sIO: socketio.Server,
    logger: Logger,
    originSocket?: socketio.Socket,
  ) {
    this.io = sIO;
    this.logger = logger;
    this.name = name;

    this.creator = originSocket ? getUsername(originSocket) : 'Lain';

    const defaultPlaylist = new Playlist('default');
    this.currentPlayList = defaultPlaylist;
    this.playlists.push(defaultPlaylist);
  }

  join(socket: socketio.Socket) {
    this.addMemberFromSocket(socket);

    this.sendRoomConfigToMember(socket);

    this.sendPlaylistToMember(socket);

    this.broadcastMemberListToAll();
  }

  exit(socket: socketio.Socket) {
    const member = this.getMemberFromSocket(socket);

    if (member) {
      this.removeMemberFromList(member);

      this.setNewLeaderIfNeeded(member);

      this.sendMsgToMembers('info', `${member.userName} left`);

      this.broadcastMemberListToAll();
    }

    socket.leave(this.name);
  }

  broadcastMessageToAll(socket: socketio.Socket, msg: IncomingGroupMessage) {
    this.sendMsgToMembers(getUsername(socket), msg.content.text);
  }

  broadcastPlaylistToAll() {
    this.io.to(this.name).emit('playlist update', this.currentPlayList.list);
  }

  broadcastMediaEventToAll(socket: socketio.Socket, data: MediaEvent) {
    socket.to(this.name).emit('media event', data);
  }

  broadcastMemberListToAll() {
    const members: RoomMemberDto[] = this.members.map(u => {
      return {
        ...u,
        isLeader: this.checkIfLeader(u)
      };
    });

    this.io.to(this.name).emit('userlist update', members);
  }

  private setLeader(member: RoomMember) {
    this.leader = member;
  }

  private checkIfLeader(member: RoomMember): boolean {
    return this.leader && this.leader.userName === member.userName;
  }

  private setNewLeaderIfNeeded(leavingMember: RoomMember) {
    const isLeader = this.leader && leavingMember.userName === this.leader.userName;

    if (isLeader) {
      const newLeader = this.members[0] || null;

      if (newLeader) {
        this.setLeader(newLeader);

        const soc = this.getSocketOfMember(newLeader);
        this.sendRoomConfigToMember(soc);
      }
    }
  }

  private removeMemberFromList(member: RoomMember) {
    this.members = this.members.filter(it => it.userName !== member.userName);
  }

  private sendPlaylistToMember(socket: socketio.Socket) {
    socket.emit('playlist update', this.currentPlayList.list);
  }

  private sendRoomConfigToMember(socket: socketio.Socket) {
    const memberConfig = this.getConfigForSocket(socket);
    socket.emit('user config', memberConfig);
  }

  private getConfigForSocket(socket: socketio.Socket): RoomMemberConfig {
    const member = this.getMemberFromSocket(socket);

    return {
      isLeader: this.checkIfLeader(member),
      isAdmin: false,
      permissionLevel: 1,
      role: Roles.Regular
    };
  }

  private addMemberFromSocket(socket: socketio.Socket) {
    try {
      const uname = getUsername(socket);

      const alreadyAdded = this.isUserIsMember(uname);
      if (alreadyAdded) {
        return;
      }

      const newMember = RoomMember.create(socket);

      if (this.members.length === 0) {
        this.setLeader(newMember);
      }

      socket.join(this.name);
      this.members.push(newMember);

      this.sendMsgToMembers('info', `${newMember.userName} joined`);

    } catch (error) {
      socket.emit('authentication error');
      return;
    }
  }

  private isUserIsMember(uname: string) {
    return this.members.filter(u => u.userName === uname).length > 0;
  }

  private sendMsgToMembers(userName: string, text: string) {
    const groupMessage: OutgoingGroupMessage = {
      roomName: this.name,
      content: {
        userName,
        text
      }
    };
    this.io.to(this.name).emit('group message', groupMessage);
  }

  private getMemberFromSocket(socket: socketio.Socket): RoomMember | null {
    const member = this.members.find(
      u => u.userName === getUsername(socket)
    );
    return member;
  }

  private getSocketOfMember(member: RoomMember) {
    const socketRef = this.io.of('/').connected[member.id];
    return socketRef;
  }
}
