import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { of } from 'rxjs';

export interface OverviewlistItem {
  roomName: string;
  description: string;
  connectedUsers: number;
  nowPlaying: string;
}

const mockList: OverviewlistItem[] = [
  {
    roomName: 'Third',
    connectedUsers: 0,
    nowPlaying: 'Quue',
    description: '2D Booty Merchant',
  },
  {
    roomName: 'Sonic',
    connectedUsers: 0,
    nowPlaying: 'create eda',
    description: 'SonicX Merchant',
  },
  {
    roomName: '2D Booty',
    connectedUsers: 0,
    nowPlaying: 'Onogai Muscle S1 E5',
    description: '2D Booty Merchant',
  },
  {
    roomName: 'Afro',
    connectedUsers: 0,
    nowPlaying: 'Spyro',
    description: 'lopklklkl',
  }
];

@Injectable({
  providedIn: 'root'
})
export class OverviewService {

  constructor(private http: HttpClient) { }

  getChannels(searchPattern?: string) {
    if (true) {
      return of(mockList);
    }

    const params = new HttpParams();
    params.append('search', searchPattern);

    return this.http.get<OverviewlistItem[]>(`${environment.api}/all-channels`, { params });
  }
}
