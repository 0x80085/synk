import { Injectable } from '@angular/core';
import { Observable, of, fromEvent, merge } from 'rxjs';
import * as io from 'socket.io-client';

import { AppStateService } from 'src/app/app-state.service';
import { environment } from 'src/environments/environment';
import { Message } from './pages/channel/models/room.models';
import { PossibleCommands } from './pages/channel/models/commands.enum';
import { switchMap, map, tap, share, withLatestFrom, catchError, mapTo } from 'rxjs/operators';
import { NzNotificationService } from 'ng-zorro-antd';

export interface RealTimeCommand {
  command: PossibleCommands;
  payload?: any;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  socket$ = of(io(`${environment.api}`)).pipe(share());


  connectionSuccess$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'connect')
          .pipe(
            this.setAppState(true, true),
            map(() => socket),
          )
      )
    );

  reconnectionAttempt$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'reconnect_attempt')
          .pipe(
            this.setAppState(true, true),
            map(() => socket),
          )
      )
    );

  reconnectionSuccess$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'reconnect')
          .pipe(
            this.setAppState(true, true),
            map(() => socket),
          )
      )
    );

  permissionError$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'error')
          .pipe(
            this.setAppState(false, false),
            tap(() => socket.close()),
            map((data: Message) => data)
          )
      )
    );

  connectionError$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'error')
          .pipe(
            this.setAppState(false, false),
            tap(() => socket.close()),
          )
      )
    );

  connectionFail$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'reconnect_failed')
          .pipe(
            this.setAppState(false, false),
            tap(() => socket.close()),
          )
      )
    );

  connectionTimeOut$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'error')
          .pipe(
            this.setAppState(false),
            tap(() => socket.close()),
          )
      )
    );

  disconnection$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'error')
          .pipe(
            this.setAppState(false)
          )
      )
    );

  isConnected$ = merge(
    this.connectionSuccess$.pipe(mapTo(true)),
    this.reconnectionSuccess$.pipe(mapTo(true)),
    this.reconnectionAttempt$.pipe(mapTo(false)),
    this.permissionError$.pipe(mapTo(false)),
    this.connectionError$.pipe(mapTo(false)),
    this.disconnection$.pipe(mapTo(false)),
    this.connectionFail$.pipe(mapTo(false)),
    this.connectionTimeOut$.pipe(mapTo(false)),
  ).pipe(
    tap((iz) => this.state.isSocketConnectedSub.next(iz)),
    tap((iz) => console.log(iz)
    ),
    share()
  );

  constructor(
    private state: AppStateService,
    private notification: NzNotificationService
  ) { }

  // connect() {
  //   socket.connect();
  // }

  // reconnect() {
  //   socket.close();
  //   socket.open();
  // }

  // removeEventListener(name: string) {
  //   socket.off(name);
  // }

  // sendEvent(ev: RealTimeCommand) {
  //   socket.emit(ev.command, ev.payload);
  // }

  emitIfConnected<T>(command$: Observable<T>) {
    return this.connectionSuccess$
      .pipe(
        switchMap(socket =>
          command$
            .pipe(
              map(data => ({ socket, data }))
            )
        ),
        this.catchSocketErr()
      );
  }

  listenForEventIfConnected(event: string) {
    return this.connectionSuccess$
      .pipe(
        switchMap(socket =>
          fromEvent(socket, event)
        )
      );
  }

  reconnect<T>(): (src: Observable<T>) => Observable<T> {
    return (source: Observable<T>) =>
      source.pipe(
        withLatestFrom(this.socket$),
        tap(([_, socket]) => {
          socket.close();
          socket.open();
        }),
        map(([src]) => src),
        this.catchSocketErr()
      );
  }

  private setAppState<T>(isConnected: boolean, isLoggedIn?: boolean): (src: Observable<T>) => Observable<T> {
    return (src: Observable<T>) =>
      src.pipe(
        tap(() => {
          this.state.isSocketConnectedSub.next(isConnected);
          if (isLoggedIn) {
            this.state.isLoggedInSubject.next(isLoggedIn);
          }
        }),
      );
  }

  private catchSocketErr<T>(): (src: Observable<T>) => Observable<T> {
    return (src: Observable<T>) =>
      src.pipe(
        catchError((err) => {
          console.log(err);
          this.notification.error('Hmm.. Something went wrong here', 'Cant reach the RT server');
          return of(err);
        }),
      )
  }
}
