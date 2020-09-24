import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { shareReplay, switchMap, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AppStateService } from '../../app-state.service';
import { SocketService } from '../../socket.service';


interface LoginInfo {
  username: string;
  password: string;
}

export interface User {
  userName: string;
  id: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  isPublic: string;
  dateCreated: string;
  isLocked: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private refreshChannelsSubject = new BehaviorSubject(true);

  userOwnedChannels$ = this.refreshChannelsSubject.pipe(
    switchMap(() =>
      this.http.get<Channel[]>(`${environment.api}/account/channels`, { withCredentials: true })
    )).pipe(
      shareReplay(1)
    );

  constructor(
    private http: HttpClient,
    private socketService: SocketService,
    private state: AppStateService
  ) { }

  createAccount(userCreds: LoginInfo) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this.http.post(`${environment.api}/signup`, userCreds, {
      headers,
      withCredentials: true
    });
  }

  login(userCreds: LoginInfo) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this.http
      .post(`${environment.api}/login`, userCreds, {
        headers,
        withCredentials: true
      })
      .pipe(
        tap(() => {
          this.state.isLoggedInSubject.next(true);
          this.socketService.socket.close();
          this.socketService.socket.open();
        })
      );
  }

  logout() {
    return this.http
      .get(`${environment.api}/logout`, {
        withCredentials: true
      })
      .pipe(
        tap(() => {
          this.state.isLoggedInSubject.next(false);
          this.socketService.socket.close();
        }),
      );
  }

  getUser() {
    return this.http.get<User>(`${environment.api}/account`, {
      withCredentials: true
    }).pipe(
      tap(res => {
        this.state.isLoggedInSubject.next(true);
        this.state.userSubject.next(res);
      }),
      shareReplay(1)
    );
  }

  refreshChannels() {
    this.refreshChannelsSubject.next(true);
  }

  deleteChannel(name: string) {
    return this.http.delete<Channel[]>(
      `${environment.api}/account/channels/${name}`,
      { withCredentials: true });
  }

}
