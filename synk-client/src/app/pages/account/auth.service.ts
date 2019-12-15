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

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient,
              private chatServ: ChatService,
              private state: AppStateService) { }

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
          this.state.loggedInSubject.next(true);
          this.chatServ.reconnect();
        })
      );
  }
}
