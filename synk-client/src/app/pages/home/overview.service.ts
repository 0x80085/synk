import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ChannelOverviewItem {
  name: string;
  description: string;
  connectedMemberCount: number;
  nowPlaying: {
    url: string,
    title: string
    length:number
    currentTime:number
};
}

@Injectable({
  providedIn: 'root'
})
export class OverviewService {

  constructor(private http: HttpClient) { }

  getChannels() {

    return this.http.get<ChannelOverviewItem[]>(
      `${environment.api}/channels/all`,
      { withCredentials: true },
    );
  }

  getAutomatedChannels() {
    
    return this.http.get<ChannelOverviewItem[]>(
      `${environment.api}/channels/automated`,
      { withCredentials: true },
    );
  }

}
