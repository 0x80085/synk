import { ItemContent } from './playlist';

export type PermissionLevels = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export enum Roles {
  Admin = 'Admin',
  Mod = 'Mod',
  Janitor = 'Janitor',
  Regular = 'Regular',
  Newbie = 'Newbie'
}

export interface RoomUser {
  id: string;
  userName: string;
  role: Roles;
  permissionLevel: PermissionLevels;
}

export type RoomUserDto = RoomUser & { isLeader: boolean };

export interface RoomUserConfig {
  role: Roles;
  permissionLevel: PermissionLevels;
  isLeader: boolean;
  isAdmin: boolean;
}
