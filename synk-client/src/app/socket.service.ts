import { Injectable } from '@angular/core';
import { Observable, of, fromEvent, merge, throwError } from 'rxjs';
import * as io from 'socket.io-client';

import { environment } from '../environments/environment';
import { switchMap, map, tap, share, withLatestFrom, catchError, mapTo, shareReplay } from 'rxjs/operators';
import { NzNotificationService } from 'ng-zorro-antd';
import { PossibleCommands } from './pages/channel/models/commands.enum';

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

  ping$ = this.listenForEvent('ping').pipe(mapTo({ event: 'ping', connected: true }));
  pong$ = this.listenForEvent('pong').pipe(mapTo({ event: 'pong', connected: true }));

  connectionSuccess$ = this.listenForEvent('connect').pipe(mapTo({ event: 'connect', connected: true }));

  reconnectionSuccess$ = this.listenForEvent('reconnect').pipe(mapTo({ event: 'reconnect', connected: true }));
  reconnectionAttempt$ = this.listenForEvent('reconnect_attempt').pipe(mapTo({ event: 'reconnect_attempt', connected: false }));
  reconnectionError$ = this.listenForEvent('reconnect_error').pipe(mapTo({ event: 'reconnect_error', connected: false }));
  reconnectionFail$ = this.listenForEvent('reconnect_failed').pipe(mapTo({ event: 'reconnect_failed', connected: false }));

  connectionError$ = this.listenForEvent('error').pipe(mapTo({ event: 'error', connected: false }));
  connectionTimeOut$ = this.listenForEvent('connect_timeout').pipe(mapTo({ event: 'connect_timeout', connected: false }));

  permissionError$ = this.listenForEvent('authentication error').pipe(mapTo({ event: 'authentication error', connected: false }));
  disconnection$ = this.listenForEvent('disconnect').pipe(mapTo({ event: 'disconnect', connected: false }));

  connectionState$ = merge(
    this.connectionSuccess$,
    this.reconnectionSuccess$,
    this.reconnectionAttempt$,
    this.reconnectionError$,
    this.permissionError$,
    this.connectionError$,
    this.disconnection$,
    this.reconnectionFail$,
    this.connectionTimeOut$,
    this.ping$,
    this.pong$,
  ).pipe(
    tap(e => console.log('connetced SOCKET::' + e)),
    tap(e => console.log(e)),
  );

  isConnected$ = this.connectionState$.pipe(
    map(({ connected }) => connected),
    shareReplay()
  );

  constructor(private notification: NzNotificationService) { }

  emitCommand(): (src: Observable<RealTimeCommand>) => Observable<RealTimeCommand> {
    return (src: Observable<RealTimeCommand>) =>
      src.pipe(
        withLatestFrom(this.socket$),
        tap(([{ command, payload }]) => console.log('emitCOmmannd', command, payload)),
        tap(([{ command, payload }, socket]) => socket.emit(command, payload)),
        map(([rtc, _]) => rtc),
        this.catchSocketErr(),
      );
  }

  listenForEvent<T>(event: string): Observable<T> {
    return this.socket$.pipe(
      switchMap((socket) =>
        fromEvent(socket, event)
      ),
      map(e => (e as T)),
    );
  }

  reconnect<T>(): (src: Observable<T>) => Observable<T> {
    return (source: Observable<T>) => source.pipe(
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
    return (source: Observable<T>) => source.pipe(
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
          return of(err);
        }),
      );
  }
}
