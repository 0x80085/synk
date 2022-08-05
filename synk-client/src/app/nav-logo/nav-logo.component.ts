import { Component, EventEmitter, Output } from '@angular/core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, shareReplay } from 'rxjs';
import { AppStateService } from '../app-state.service';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-nav-logo',
  templateUrl: './nav-logo.component.html',
  styleUrls: ['./nav-logo.component.scss']
})
export class NavLogoComponent {

  hostName = new BehaviorSubject(window.location.hostname);

  @Output() clicked = new EventEmitter();

  stateSubject = new BehaviorSubject({
    loggedIn: false,
    socketConnected: false,
    isAdmin: false,
    username: ""
  })

  distiller$ = combineLatest([
    this.stateService.isLoggedIn$,
    this.socketService.connectionSuccess$,
    this.stateService.me$,
  ]).pipe(
    map(([isLoggedIn, { connected }, { isAdmin, username }]) => {
      this.stateSubject.next({
        loggedIn: isLoggedIn,
        socketConnected: connected,
        isAdmin: isAdmin,
        username
      })
    })
  )

  state$ = combineLatest([
    this.distiller$,
    this.stateSubject
  ]).pipe(
    map(([, it]) => it),
    distinctUntilChanged(),
    shareReplay(1)
  )

  constructor(
    private socketService: SocketService,
    private stateService: AppStateService
  ) { }

}
