import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ChatService } from '../channel/chat.service';
import { tap, mapTo } from 'rxjs/operators';
import { AppStateService } from 'src/app/app-state.service';

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
    private chatServ: ChatService,
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
          this.chatServ.reconnect();
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
          this.state.isLoggedInSubject.next(true);
          this.chatServ.reconnect();
        })
      );
  }

  getUser() {
    return this.http.get<User>(`${environment.api}/account`, {
      withCredentials: true
    });
  }

}
