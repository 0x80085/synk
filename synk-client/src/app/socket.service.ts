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

  socket = io(`${environment.api}`, { transports: ['websocket'], upgrade: false });

  private socket$ = of(this.socket).pipe(
    share()
  );

  connectionSuccess$ = this.listenForEvent('connect').pipe(mapTo({ event: 'connect', connected: true }));
  reconnectionAttempt$ = this.listenForEvent('reconnect_attempt').pipe(mapTo({ event: 'reconnect_attempt', connected: false }));
  reconnectionSuccess$ = this.listenForEvent('reconnect').pipe(mapTo({ event: 'reconnect', connected: true }));
  permissionError$ = this.listenForEvent('authentication error').pipe(mapTo({ event: 'error', connected: false }));
  connectionError$ = this.listenForEvent('error').pipe(mapTo({ event: 'error', connected: false }));
  connectionFail$ = this.listenForEvent('reconnect_failed').pipe(mapTo({ event: 'reconnect_failed', connected: false }));
  connectionTimeOut$ = this.listenForEvent('connect_timeout').pipe(mapTo({ event: 'connect_timeout', connected: false }));
  disconnection$ = this.listenForEvent('disconnect').pipe(mapTo({ event: 'disconnect', connected: false }));

  connectionState$ = merge(
    this.connectionSuccess$,
    this.reconnectionSuccess$,
    this.reconnectionAttempt$,
    this.permissionError$,
    this.connectionError$,
    this.disconnection$,
    this.connectionFail$,
    this.connectionTimeOut$,
  ).pipe(
    tap((iz) => console.log(iz)),
    share()
  );

  isConnected$ = this.connectionState$.pipe(
    map(({ connected }) => connected),
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
