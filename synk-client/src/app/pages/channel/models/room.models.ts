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

export enum RoomCommands {
  PM = 'private message',
  JOIN_ROOM = 'join room',
  EXIT_ROOM = 'exit room',
  GROUP_MESSAGE = 'group message',
  GIVE_LEADER = 'give leader',
  USER_CONFIG = 'user config',
  USER_LIST_UPDATE = 'userlist update',
}

export interface RoomUser {
  id: string;
  userName: string;
  role: Roles;
  isLeader: boolean;
  permissionLevel: PermissionLevels;
}

export type RoomUserDto = RoomUser & { isLeader: boolean };

export interface RoomUserConfig {
  role: Roles;
  permissionLevel: PermissionLevels;
  isLeader: boolean;
  isOwner: boolean;
}
