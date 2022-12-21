import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ChannelOverviewItem, ConnectionsResponse, UserInfo } from './admin.models';
import { Channel } from './auth.service';


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
    });
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
      map(data => data.items)
    );
  }

  getAutomatedChannels() {
    return this.http.get<ChannelOverviewItem[]>(
      `${environment.api}/channels/automated`,
      { withCredentials: true },
    );
  }

  getConnections(): Observable<ConnectionsResponse> {
    return this.http.get<ConnectionsResponse>(`${environment.api}/admin/connections`, {
      withCredentials: true,
    }).pipe(
    );
  }
  startScraper(channelName: string, subreddit: string) {
    return this.http.post(`${environment.api}/admin/start-scrape-subreddit/${channelName}/${subreddit}`, null, { withCredentials: true })
  }
  stopScraper() {
    return this.http.post(`${environment.api}/admin/ stop-scrape-subreddit`, null, { withCredentials: true })
  }
  startPlayback(name: string) {
    return this.http.post(`${environment.api}/admin/start-auto-playback/${name}`, null, { withCredentials: true })
  }
  stopPlayback(name: string) {
    return this.http.post(`${environment.api}/admin/stop-auto-playback/${name}`, null, { withCredentials: true })
  }
  clearPlaylist(name: string) {
    return this.http.post(`${environment.api}/admin/clear-playlist/${name}`, null, { withCredentials: true })
  }
  playNext(name: string) {
    return this.http.post(`${environment.api}/admin/play-next-auto-playback/${name}`, null, { withCredentials: true })
  }

  startScrapeJobManually() {
    return this.http.post(`${environment.api}/admin/start-crawler-job`, null, { withCredentials: true })
  }

  getInvidiousUrls(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.api}/admin/invidious-urls`, { withCredentials: true })
  }

  patchInvidiousUrls(urls:string[]) {
    return this.http.patch(`${environment.api}/admin/invidious-urls`, urls, { withCredentials: true })
  }

  getGlobalSettings(): Observable< { [key: string]: string; }> {
    return this.http.get< { [key: string]: string; }>(`${environment.api}/admin/global-settings`, { withCredentials: true })
  }

  patchGlobalSettings(urls: { [key: string]: string; }) {
    return this.http.patch(`${environment.api}/admin/global-settings`, urls, { withCredentials: true })
  }

}
