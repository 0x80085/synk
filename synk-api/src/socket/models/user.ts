import * as socketio from 'socket.io';

import { getUsername } from './socket.passport';

export type PermissionLevels = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export enum Roles {
  Admin = 'Admin',
  Mod = 'Mod',
  Janitor = 'Janitor',
  Regular = 'Regular',
  Newbie = 'Newbie'
}

export class RoomMember {
  id: string;
  userName: string;
  role: Roles;
  permissionLevel: PermissionLevels;

  static create(socket: socketio.Socket): RoomMember {
    return {
      id: socket.id,
      permissionLevel: 1,
      userName: getUsername(socket),
      role: Roles.Regular
    };
  }
}

export type RoomMemberDto = RoomMember & { isLeader: boolean };

export interface RoomMemberConfig {
  role: Roles;
  permissionLevel: PermissionLevels;
  isLeader: boolean;
  isAdmin: boolean;
}
