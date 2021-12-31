export interface Message {
  username?: string;
  text: string;
  isSystemMessage: boolean
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
  YOU_ARE_LEADER = 'you are leader',
  LEADER_ROLE_PASSED_ON_SUCCESS = 'leader role passed on success',
}

export enum RoomErrors {
  ALREADY_JOINED = 'already joined'
}

export interface RoomUser {
  id: string;
  username: string;
  isLeader: boolean;
}

export interface RoomUserConfig {
  role: Roles;
  isLeader: boolean;
  isOwner: boolean;
  isAutomatedChannel: boolean;
}
