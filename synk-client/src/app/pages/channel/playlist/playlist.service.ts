import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { MediaEvent } from '../models/room.models';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

  constructor(private http: HttpClient) { }

  getPlaylistById(id: string) {
    return this.http.get(`${environment.api}/playlists/${id}`, { withCredentials: true });
  }

  getMyPlaylists() {
    return this.http.get(`${environment.api}/user/playlists`, { withCredentials: true });
  }

  addVideoToList(media: MediaEvent, playlistId: string) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const opts = {
      headers,
      withCredentials: true,
    };
    return this.http.put(`${environment.api}/playlists/${playlistId}`, { media }, opts);
  }

  createPlaylist(playlistName: string) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const opts = {
      headers,
      withCredentials: true,
    };
    return this.http.post(`${environment.api}/playlists/create`, { playlistName }, opts);
  }

  deletePlaylist(id: string) {
    return this.http.delete(`${environment.api}/playlists/${id}`, { withCredentials: true });
  }
}
