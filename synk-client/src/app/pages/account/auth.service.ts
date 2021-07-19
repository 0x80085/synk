import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
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
  username: string;
  id: string;
  isAdmin: boolean;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  isPublic: string;
  dateCreated: string;
  isLocked: boolean;
  connectedMemberCount: number;
  nowPlaying: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private refreshChannelsSubject = new BehaviorSubject(true);

  // TODO Should be in some other service tho
  userOwnedChannels$ = this.refreshChannelsSubject.pipe(
    switchMap(() =>
      this.http.get<Channel[]>(`${environment.api}/channels/mine`, { withCredentials: true })
    )).pipe(
      shareReplay(1)
    );

  constructor(
    private http: HttpClient,
    private socketService: SocketService,
    private state: AppStateService,
    private router: Router
  ) { }

  createAccount(userCreds: LoginInfo) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this.http.post(`${environment.api}/auth/sign-up`, userCreds, {
      headers,
      withCredentials: true
    });
  }

  login(userCreds: LoginInfo) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this.http
      .post(`${environment.api}/auth/login`, userCreds, {
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
      .post(`${environment.api}/auth/logout`, null)
      .pipe(
        tap(() => {
          this.state.isLoggedInSubject.next(false);
          this.socketService.socket.close();
          this.state.userSubject.next(null);
          this.router.navigate(['']);
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

  // TODO Should also be in other service tho
  deleteChannel(id: string) {
    return this.http.delete<Channel[]>(
      `${environment.api}/channels/${id}`,
      { withCredentials: true });
  }

}
