import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface OverviewlistItem {
  roomName: string;
  description: string;
  memberCount: number;
  currentlyPlaying: string;
}

export interface ChannelDraft {
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class OverviewService {
  constructor(private http: HttpClient) {}

  getChannels(searchPattern?: string) {
    const params = new HttpParams();
    params.append('search', searchPattern);

    return this.http.get<OverviewlistItem[]>(
      `${environment.api}/public-rooms`,
      { params, withCredentials: true }
    );
  }

}