import { Injectable } from '@angular/core';
import { of, Subject, BehaviorSubject } from 'rxjs';
import { User } from './pages/account/auth.service';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {

  isLoggedInSubject: Subject<boolean> = new Subject();
  isSocketConnectedSub: Subject<boolean> = new Subject();
  userSubject: BehaviorSubject<User> = new BehaviorSubject({ id: 'missingno', userName: '-----' });

  isLoggedIn$ = this.isLoggedInSubject.pipe(share());
  isSocketConnected$ = this.isSocketConnectedSub.pipe(share());
  me$ = this.userSubject.pipe(share());

  constructor() {
    this.isLoggedInSubject.next(false);
    this.isSocketConnectedSub.next(false);
  }
}
