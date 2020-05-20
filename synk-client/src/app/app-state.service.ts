import { Injectable } from '@angular/core';
import { of, Subject, BehaviorSubject, merge } from 'rxjs';
import { User } from './pages/account/auth.service';
import { share, tap, catchError, mapTo, map, startWith } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {

  isLoggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  userSubject: BehaviorSubject<User> = new BehaviorSubject({ id: 'missingno', userName: '-----' });

  me$ = this.http.get<User>(`${environment.api}/account`,
    {
      withCredentials: true
    }).pipe(
      startWith({ id: 'missingno', userName: '-----' }),
      share(),
      catchError(() => (of(null)))
    );

  isLoggedIn$ = merge(
    this.me$.pipe(map(me => !!me)),
    this.socketService.isConnected$,
    this.isLoggedInSubject
  ).pipe(
    share(),
  );

  constructor(
    private http: HttpClient,
    private socketService: SocketService,
  ) { }
}
