import { Injectable } from '@angular/core';
import { BehaviorSubject, merge, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

import { User } from './pages/account/auth.service';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {

  isLoggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLogged$ = this.isLoggedInSubject.pipe(shareReplay(1));

  userSubject: BehaviorSubject<User> = new BehaviorSubject({ id: 'missingno', username: '-----', isAdmin: false });
  me$ = this.userSubject.pipe();


  isAdmin$ = this.userSubject.pipe(
    map(user => user.isAdmin),
    catchError(() => of(false))
  );

  isLoggedIn$ = merge(
    this.me$.pipe(map(me => !!me)),
    this.socketService.isConnected$,
    this.isLogged$
  );

  constructor(private socketService: SocketService) { }
}

const mockAdmin = (user: User) =>
  user.username === 'JanitorOne'
  || user.username === 'root';

