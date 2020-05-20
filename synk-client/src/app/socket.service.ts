import { Injectable } from '@angular/core';
import { Observable, of, fromEvent, merge, iif, noop } from 'rxjs';
import * as io from 'socket.io-client';

import { AppStateService } from 'src/app/app-state.service';
import { environment } from 'src/environments/environment';
import { Message } from './pages/channel/models/room.models';
import { PossibleCommands } from './pages/channel/models/commands.enum';
import { switchMap, map, tap, share, withLatestFrom, catchError, mapTo, startWith, filter } from 'rxjs/operators';
import { NzNotificationService } from 'ng-zorro-antd';

export interface RealTimeCommand {
  command: PossibleCommands;
  payload?: any;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  socket = io(`${environment.api}`);

  private socket$ = of(this.socket).pipe(
    tap((socket) => {
      socket.open();
    }),
    share()
  );

  connectionSuccess$ = this.socket$
    .pipe(
      tap((iz) => console.log(iz)),
      switchMap(socket =>
        fromEvent(socket, 'connect')
          .pipe(
            tap((iz) => console.log(iz)),
            mapTo(socket),
          )
      ),
      catchError(e => {
        console.log(e);
        throw new Error(e);
      }),
      share()
    );

  reconnectionAttempt$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'reconnect_attempt')
          .pipe(
            tap((iz) => console.log(iz)),
            map(() => socket),
          )
      )
    );

  reconnectionSuccess$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'reconnect')
          .pipe(
            map(() => socket),
          )
      )
    );

  permissionError$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'authentication error')
          .pipe(
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
            tap(() => socket.close()),
          )
      )
    );

  connectionFail$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'reconnect_failed')
          .pipe(
            tap(() => socket.close()),
          )
      )
    );

  connectionTimeOut$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'connect_timeout')
          .pipe(
            tap(() => socket.close()),
          )
      )
    );

  disconnection$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'disconnect'))
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
    tap((iz) => console.log(iz)),
    tap((iz) => console.log('isConnected$: ', iz)),
    share()
  );

  constructor(private notification: NzNotificationService) { }

  emit(command$: Observable<any>) {
    return this.socket$
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

  listenForEvent<T>(event: string): Observable<T> {
    return this.socket$.pipe(
      switchMap((socket) =>
        fromEvent(socket, event)
      ),
      map(e => (e as T)),
      tap((e) => console.log(e)),
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

  close<T>(): (src: Observable<T>) => Observable<T> {
    return (source: Observable<T>) =>
      source.pipe(
        withLatestFrom(this.socket$),
        tap(([_, socket]) => {
          socket.close();
        }),
        map(([src]) => src),
        this.catchSocketErr()
      );
  }

  private catchSocketErr<T>(): (src: Observable<T>) => Observable<T> {
    return (src: Observable<T>) =>
      src.pipe(
        catchError((err) => {
          console.log(err);
          this.notification.error('Hmm.. Something went wrong here', 'Cannot reach the RT server');
          throw new Error(err);
          // return of(err);
        }),
      );
  }
}
