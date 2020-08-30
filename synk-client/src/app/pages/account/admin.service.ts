import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { User } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { tap, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  getUsers(pagzeSize?: number, index?: number): Observable<User[]> {
    return this.http.get<User[]>(`${environment.api}/account`, {
      withCredentials: true
    }).pipe(
      tap(res => {
        // this.state.isLoggedInSubject.next(true);
        // this.state.userSubject.next(res);
      }),
      shareReplay()
    );
  }

}
