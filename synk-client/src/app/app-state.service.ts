import { Injectable } from '@angular/core';
import { of, Subject } from 'rxjs';
import { User } from './pages/account/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {

  isLoggedInSubject: Subject<boolean> = new Subject();
  isSocketConnectedSub: Subject<boolean> = new Subject();
  userSubject: Subject<User> = new Subject();

  isLoggedIn$ = this.isLoggedInSubject.pipe();
  isSocketConnected$ = this.isSocketConnectedSub.pipe();
  me$ = this.userSubject.pipe();

  constructor() {
    this.isLoggedInSubject.next(false);
    this.isSocketConnectedSub.next(false);
    this.userSubject.next({ id: 'missingno', userName: '-----' });
  }
}
