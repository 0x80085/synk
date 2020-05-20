import { Injectable } from '@angular/core';
import { of, Subject, BehaviorSubject, merge } from 'rxjs';
import { User } from './pages/account/auth.service';
import { share, tap, catchError, mapTo, map, startWith } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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
    this.isLoggedInSubject
  ).pipe(
    share(),
  );

  constructor(
    private http: HttpClient,
  ) { }

  getUser() {
    return this.http.get<User>(`${environment.api}/account`, {
      withCredentials: true
    }).pipe(
      tap(res => {
        this.isLoggedInSubject.next(true);
      })

    );
  }
}
