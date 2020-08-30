import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { User } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { tap, shareReplay, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  getUsers(query?: string, pagzeSize?: number, index?: number): Observable<User[]> {
    return this.http.get<User[]>(`${environment.api}/DOESN NO EXISTS/`, {
      withCredentials: true
    }).pipe(
      shareReplay(1),
      catchError(() => of([{ id: "IDXXXX", userName: 'Peter Post' } as User]))
    );
  }

}
