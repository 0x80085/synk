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


  connectionSuccessEvent$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'connect')
          .pipe(
            this.setAppState(true, true),
            map(() => socket),
          )
      )
    );

  reconnectionSuccessEvent$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'reconnect')
          .pipe(
            this.setAppState(true, true),
            map(() => socket),
          )
      )
    );

  permissionErrorEvent$ = this.socket$
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

  connectionErrorEvent$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'error')
          .pipe(
            this.setAppState(false, false),
            tap(() => socket.close()),
          )
      )
    );

  connectionTimeOutEvent$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'error')
          .pipe(
            this.setAppState(false),
            tap(() => socket.close()),
          )
      )
    );

  disconnectionEvent$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'error')
          .pipe(
            this.setAppState(false)
          )
      )
    );

  connectionState$ = merge(
    this.connectionSuccessEvent$.pipe(mapTo(true)),
    this.reconnectionSuccessEvent$.pipe(mapTo(true)),
    this.permissionErrorEvent$.pipe(mapTo(false)),
    this.connectionErrorEvent$.pipe(mapTo(false)),
    this.disconnectionEvent$.pipe(mapTo(false)),
    this.connectionTimeOutEvent$.pipe(mapTo(false)),
  ).pipe(
    tap((iz) => this.state.isSocketConnectedSub.next(iz)),
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
    return this.connectionSuccessEvent$
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
    return this.connectionSuccessEvent$
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
        map(([_, s]) => _),
        // this.catchSocketErr()
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
