import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { AppStateService } from 'src/app/app-state.service';
import { SocketService } from 'src/app/socket.service';

interface LoginInfo {
  username: string;
  password: string;
}

export interface User {
  userName: string;
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

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
        }),
        this.socketService.reconnect()
      );
  }

  logout() {
    return this.http
      .get(`${environment.api}/logout`, {
        withCredentials: true
      })
      .pipe(
        tap(() => {
          this.state.isLoggedInSubject.next(true);
          this.socketService.reconnect();
        })
      );
  }

  getUser() {
    return this.http.get<User>(`${environment.api}/account`, {
      withCredentials: true
    }).pipe(
      tap(res => {
        this.state.isLoggedInSubject.next(true);
        this.state.userSubject.next(res);
      })

    );
  }

}
