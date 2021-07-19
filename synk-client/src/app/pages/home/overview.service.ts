import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface OverviewlistItem {
  name: string;
  description: string;
  connectedMemberCount: number;
  nowPlaying: string;
}

export interface ChannelDraft {
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class OverviewService {
  constructor(private http: HttpClient) { }

  getChannels() {

    return this.http.get<OverviewlistItem[]>(
      `${environment.api}/channels/all`,
      { withCredentials: true },
    );
  }

}
