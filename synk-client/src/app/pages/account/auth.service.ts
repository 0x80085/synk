import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ChatService } from '../channel/chat.service';
import { tap, mapTo } from 'rxjs/operators';

interface LoginInfo {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn = false;

  constructor(private http: HttpClient, private chatServ: ChatService) {}

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
          this.isLoggedIn = true;
          this.chatServ.reconnect();
        })
      );
  }
}
