import { Channel } from "./auth.service";

interface ChannelSummary {
  roomName: string;
  description: string;
  memberCount?: number;
  currentlyPlaying?: string;
}

export interface ChannelOverviewItem {
  name: string;
  description: string;
  connectedMemberCount: number;
  subredditsToScrape: string[];
  dateCreated: Date;
  nowPlaying: {
    url: string,
    title: string
    length:number
    currentTime:number
};
}

export interface RoomDto {
  id: string;
  name: string;
  members: UserOfRoomInfo[];
  creator: string;
}

export interface UserSocketInfo {
  id: string;
  socketId: string;
  username: string;
}

export interface UserAccountInfo {
  id: string;
  channels: Channel[];
  isAdmin: boolean;
  username: string;
  dateCreated: Date;
  lastSeen: Date;
}

export interface UserOfRoomInfo {
  id: string;
  username: string;
  role: string;
  permissionLevel: string;
}

export interface UserInfo {
  items: UserAccountInfo[];
  meta: any;
}

export interface ChannelResponse {
  channels: {
    id: string;
    name: string;
    dateCreated: Date;
    isLocked: boolean;
    isPublic: boolean;
    description: string;
    owner: {
      id: string;
      isAdmin: boolean;
      username: string;
    };
  }[];
  rooms: RoomDto[];
  publicChannels: ChannelSummary[];
}

export interface ConnectionsResponse {
  clients: {
    ip: string;
    socketId: string;
    memberId: string;
  }[];
  members: {
    memberId: string;
    roomConnections: {
      roomId: string;
      socketId: string;
    }[];
  }[];
}
