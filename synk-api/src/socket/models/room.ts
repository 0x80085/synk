import * as socketio from 'socket.io';

import { RoomMember, RoomMemberConfig, Roles, RoomMemberDto } from './user';
import {
  OutgoingGroupMessage,
  IncomingGroupMessage,
  MediaEvent
} from './message';
import { Playlist } from './playlist';
import { Logger } from '../../tools/logger';
import { getUsername, SocketPassport } from './socket.passport';
import { RequiresAuthentication } from '../decorators/auth.decorator';

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
  private logger: Logger;

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

  @RequiresAuthentication()
  join(socket: socketio.Socket) {
    this.addMemberFromSocket(socket,
      () => {
        this.sendRoomConfigToMember(socket);
        this.sendPlaylistToMember(socket);
        this.broadcastMemberListToAll();
      },
      (e) => socket.emit(e)
    );

  }

  @RequiresAuthentication()
  giveLeader(originSocket: SocketPassport, to: string) {
    const initiator = this.getMemberFromSocket(originSocket);

    if (initiator && initiator.userName !== this.leader.userName) {
      return;
    }

    const candidate = this.getMemberByName(to);

    if (!candidate) {
      return;
    }

    const candidateSocket = this.getSocketOfMember(candidate);

    this.setLeader(candidate);

    this.sendRoomConfigToMember(originSocket);
    this.sendRoomConfigToMember(candidateSocket);

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

  @RequiresAuthentication()
  broadcastMessageToAll(socket: socketio.Socket, msg: IncomingGroupMessage) {
    this.sendMsgToMembers(getUsername(socket), msg.content.text);
  }

  broadcastPlaylistToAll() {
    this.io.to(this.name).emit('playlist update', this.currentPlayList.list);
  }

  @RequiresAuthentication()
  broadcastMediaEventToAll(socket: socketio.Socket, data: MediaEvent) {
    socket.to(this.name).emit('media event', data);
  }

  broadcastMemberListToAll() {
    const members: RoomMemberDto[] = this.members.map(u => {
      return {
        ...u,
        isLeader: this.checkIfLeader(u),
        isOwner: this.checkIfOwner(u)
      };
    });

    this.io.to(this.name).emit('userlist update', members);
  }

  @RequiresAuthentication()
  playNextMedia(socket: SocketPassport) {
    const initiator = this.getMemberFromSocket(socket);

    if (initiator && initiator.userName !== this.leader.userName) {
      return;
    }
    this.currentPlayList.skip();
    this.broadcastPlaylistToAll();
  }

  @RequiresAuthentication()
  shufflePlaylist(socket: SocketPassport) {
    const initiator = this.getMemberFromSocket(socket);

    if (initiator && initiator.userName !== this.leader.userName) {
      return;
    }
    this.currentPlayList.shuffle();
    this.broadcastPlaylistToAll();
  }

  private setLeader(member: RoomMember) {
    this.leader = member;
  }

  private checkIfLeader(member: RoomMember): boolean {
    return this.leader && this.leader.userName === member.userName;
  }

  private checkIfOwner(member: RoomMember) {
    return this.creator && this.creator === member.userName;
  }

  private setNewLeaderIfNeeded(leavingMember: RoomMember) {
    const isLeader = this.leader && leavingMember.userName === this.leader.userName;

    if (isLeader) {
      const newLeader = this.members[0] || null;

      if (newLeader) {
        this.setLeader(newLeader);

        const soc = this.getSocketOfMember(newLeader);
        this.sendRoomConfigToMember(soc);
      } else {
        this.setLeader(null);
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
      isOwner: this.checkIfOwner(member),
      permissionLevel: 1,
      role: Roles.Regular
    };
  }

  private addMemberFromSocket(
    socket: socketio.Socket,
    next: () => void = () => { },
    error: (err: any) => void = () => { }
  ) {
    const uname = getUsername(socket);

    const alreadyAdded = this.isUserIsMember(uname);
    if (alreadyAdded) {
      error('already joined');
      return;
    }

    const newMember = RoomMember.create(socket);

    if (this.members.length === 0) {
      this.setLeader(newMember);
    }

    socket.join(this.name);
    this.members.push(newMember);

    this.sendMsgToMembers('info', `${newMember.userName} joined`);
    next();
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

  private getMemberByName(name: string): RoomMember | null {
    const member = this.members.find(
      u => u.userName === name
    );
    return member;
  }

  private getSocketOfMember(member: RoomMember) {
    const socketRef = this.io.of('/').connected[member.id];
    return socketRef;
  }
}

