export interface Message {
  userName?: string;
  text: string;
}

export interface RoomMessage {
  content: Message;
  roomName: string;
}

export interface MediaEvent {
  mediaUrl: string;
  currentTime: number;
  roomName: string;
}

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
  isLeader: boolean;
  permissionLevel: PermissionLevels;
}

export interface RoomUserConfig {
  role: Roles;
  permissionLevel: PermissionLevels;
  isLeader: boolean;
  isAdmin: boolean;
}
