import { Injectable } from '@angular/core';
import { of, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {

  loggedInSubject: Subject<boolean> = new Subject();
  isSocketConnectedSub: Subject<boolean> = new Subject();

  isLoggedIn$ = this.loggedInSubject.pipe();
  isSocketConnected$ = this.isSocketConnectedSub.pipe();

  constructor() {
    this.loggedInSubject.next(false);
  }
}
