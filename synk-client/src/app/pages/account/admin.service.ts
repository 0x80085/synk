import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Channel } from './auth.service';

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

  getUsers(query?: string, page?: number, limit?: number): Observable<UserInfo> {
    const params = new HttpParams({
      fromObject: {
        limit: String(limit || 100),
        page: String(page || 1),
      }
    });
    return this.http.get<UserInfo>(`${environment.api}/admin/members`, {
      withCredentials: true,
      params
    }).pipe(
      shareReplay(1)
    );
  }

  getChannels(query?: string, page?: number, limit?: number): Observable<Channel[]> {
    const params = new HttpParams({
      fromObject: {
        limit: String(limit || 100),
        page: String(page || 1),
      }
    });
    return this.http.get<{ items: Channel[], meta: any }>(`${environment.api}/admin/channels`, {
      withCredentials: true,
      params
    }).pipe(
      map(data => data.items),
      shareReplay(1)
    );
  }

  getConnections(): Observable<ConnectionsResponse> {
    return this.http.get<ConnectionsResponse>(`${environment.api}/admin/connections`, {
      withCredentials: true,
    }).pipe(
    );
  }
  startScraper(subreddit: string) {
    return this.http.post(`${environment.api}/admin/start-scrape-subreddit/${subreddit}`, null, { withCredentials: true })
  }
  stopScraper() {
    return this.http.post(`${environment.api}/admin/ stop-scrape-subreddit`, null, { withCredentials: true })
  }
  startPlayback() {
    return this.http.post(`${environment.api}/admin/start-auto-playback`, null, { withCredentials: true })
  }
  stopPlayback() {
    return this.http.post(`${environment.api}/admin/stop-auto-playback`, null, { withCredentials: true })
  }
  clearPlaylist() {
    return this.http.post(`${environment.api}/admin/clear-playlist`, null, { withCredentials: true })
  }
  playNext() {
    return this.http.post(`${environment.api}/admin/play-next-auto-playback`, null, { withCredentials: true })
  }

}
