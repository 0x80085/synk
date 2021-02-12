import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { User, Channel } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { tap, shareReplay, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface ChannelSummary {
  roomName: string;
  description: string;
  memberCount?: number;
  currentlyPlaying?: string;
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
  accounts: UserAccountInfo[];
  usersActiveInAtLeastOneRoom: UserOfRoomInfo[];
  usersConnectedToSocketServer: UserSocketInfo[];
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

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  deleteRoom(id: string) {
    return this.http.delete(`${environment.api}/admin/channels/${id}`, {
      withCredentials: true
    });
  }

  constructor(private http: HttpClient) { }

  getUsers(query?: string, pagzeSize?: number, index?: number): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${environment.api}/admin/members`, {
      withCredentials: true
    }).pipe(
      shareReplay(1)
    );
  }

  getRooms(query?: string, pagzeSize?: number, index?: number): Observable<ChannelResponse> {
    return this.http.get<ChannelResponse>(`${environment.api}/admin/rooms`, {
      withCredentials: true
    }).pipe(
      shareReplay(1)
    );
  }

  getChannels(query?: string, pagzeSize?: number, index?: number): Observable<ChannelResponse> {
    return this.http.get<ChannelResponse>(`${environment.api}/admin/channels`, {
      withCredentials: true
    }).pipe(
      shareReplay(1)
    );
  }

}
