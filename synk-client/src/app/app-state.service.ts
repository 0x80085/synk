import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, merge, of } from 'rxjs';
import { catchError, map, share, shareReplay, startWith, tap } from 'rxjs/operators';

import { environment } from '../environments/environment';
import { User } from './pages/account/auth.service';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {

  isLoggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  userSubject: BehaviorSubject<User> = new BehaviorSubject({ id: 'missingno', userName: '-----' });

  me$ = this.http.get<User>(`${environment.api}/account`, { withCredentials: true }).pipe(
    shareReplay(1),
  );

  isAdmin$ = this.me$.pipe(
    map(user => ({ ...user, isAdmin: true })), // remove after tests
    map(user => user.isAdmin),
    tap(user =>console.log('isAdmin'))
  );

  isLoggedIn$ = merge(
    this.me$.pipe(map(me => !!me)),
    this.socketService.isConnected$,
    this.isLoggedInSubject
  ).pipe(
    shareReplay(1),
  );

  constructor(
    private http: HttpClient,
    private socketService: SocketService,
  ) { }
}
