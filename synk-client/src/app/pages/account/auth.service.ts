import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { AppStateService } from 'src/app/app-state.service';
import { SocketService } from 'src/app/socket.service';
import { of } from 'rxjs';

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
        this.socketService.reconnect(),
        // catchError(err => {
        //   this.state.isLoggedInSubject.next(false);
        //   return of(err);
        // })
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
        }),
        this.socketService.close()
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
