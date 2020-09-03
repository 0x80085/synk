import { Injectable } from '@angular/core';
import { BehaviorSubject, merge, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { User } from './pages/account/auth.service';
import { SocketService } from './socket.service';


@Injectable({
  providedIn: 'root'
})
export class AppStateService {

  isLoggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  userSubject: BehaviorSubject<User> = new BehaviorSubject({ id: 'missingno', userName: '-----' });

  me$ = this.userSubject.pipe();

  isAdmin$ = this.userSubject.pipe(
    map(user => ({ ...user, isAdmin: true })), // remove after tests
    map(user => user.isAdmin),
    catchError(() => of(false))
  );

  isLoggedIn$ = merge(
    this.me$.pipe(map(me => !!me)),
    this.socketService.isConnected$,
    this.isLoggedInSubject
  );

  constructor(private socketService: SocketService) { }
}
