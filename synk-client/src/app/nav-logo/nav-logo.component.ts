import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { catchError, combineLatest, distinctUntilChanged, map, Observable, of, shareReplay, startWith } from 'rxjs';
import { AppStateService } from '../app-state.service';
import { AuthService } from '../pages/account/auth.service';
import { SocketService } from '../socket.service';

type NavState = {
  loggedIn: boolean;
  socketConnected: boolean;
  isAdmin: boolean;
  username: string;
};

@Component({
  selector: 'app-nav-logo',
  templateUrl: './nav-logo.component.html',
  styleUrls: ['./nav-logo.component.scss']
})
export class NavLogoComponent implements OnInit {

  @Output() clicked = new EventEmitter();

  // stateSubject = new BehaviorSubject({
  //   loggedIn: false,
  //   socketConnected: false,
  //   isAdmin: false,
  //   username: ""
  // })

  private readonly initialState = {
    loggedIn: false,
    socketConnected: false,
    isAdmin: false,
    username: ''
  }

  state$: Observable<NavState> = combineLatest([
    this.stateService.isLoggedIn$,
    this.stateService.isLoggedInAndConnected$,
    this.socketService.isConnected$,
    this.stateService.me$,
  ]).pipe(
    map(([isLoggedIn,isconnected, isSocketConnected_ ,{ isAdmin, username }]) =>
    ({
      loggedIn: isLoggedIn || isconnected,
      socketConnected: isconnected || isSocketConnected_,
      isAdmin: isAdmin,
      username
    })),
    startWith(this.initialState),
    catchError(_ => (of(this.initialState))),
    map(it => it as NavState),
    distinctUntilChanged(
      // (prev, now) =>
      // prev.loggedIn === now.loggedIn
      // || prev.socketConnected === now.socketConnected
      // || prev.username === now.username
      ),
    shareReplay(1),
  )

  constructor(
    private socketService: SocketService,
    private stateService: AppStateService,
    private auth: AuthService,
  ) { }

  ngOnInit(): void {
    this.auth.getUser(true).pipe(
    ).subscribe()
  }

}
