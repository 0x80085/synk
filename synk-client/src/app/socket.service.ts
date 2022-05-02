import { Injectable } from '@angular/core';
import { Observable, of, fromEvent, merge } from 'rxjs';
import io from 'socket.io-client';

import { environment } from '../environments/environment';
import { switchMap, map, tap, share, withLatestFrom, catchError, mapTo, shareReplay } from 'rxjs/operators';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PossibleCommands, SocketCommands } from './pages/channel/models/commands.enum';
import { doLog } from './utils/custom.operators';

export interface RealTimeCommand {
  command: PossibleCommands;
  payload?: any;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  socket = io(`${environment.api}`, { withCredentials: true, transports: ['websocket', 'polling', 'flashsocket'] });

  private socket$ = of(this.socket).pipe(
    share()
  );

  connectionSuccess$ = this.listenForEvent(SocketCommands.CONNECT).pipe(mapTo({ event: SocketCommands.CONNECT, connected: true }));

  reconnectionSuccess$ = this.listenForEvent(SocketCommands.RECONNECT).pipe(mapTo({ event: SocketCommands.RECONNECT, connected: true }));
  reconnectionAttempt$ = this.listenForEvent(SocketCommands.RECONNECT_ATTEMPT).pipe(mapTo({ event: SocketCommands.RECONNECT_ATTEMPT, connected: false }));
  reconnectionError$ = this.listenForEvent(SocketCommands.RECONNECT_ERROR).pipe(mapTo({ event: SocketCommands.RECONNECT_ERROR, connected: false }));
  reconnectionFail$ = this.listenForEvent(SocketCommands.RECONNECT_FAILED).pipe(mapTo({ event: SocketCommands.RECONNECT_FAILED, connected: false }));

  connectionError$ = this.listenForEvent(SocketCommands.ERROR).pipe(mapTo({ event: SocketCommands.ERROR, connected: false }));
  connectionTimeOut$ = this.listenForEvent(SocketCommands.CONNECT_TIMEOUT).pipe(mapTo({ event: SocketCommands.CONNECT_TIMEOUT, connected: false }));

  exceptionEvent$ = this.listenForEvent<{ status: string, message: string }>(SocketCommands.EXCEPTION);

  disconnection$ = this.listenForEvent(SocketCommands.DISCONNECT).pipe(mapTo({ event: SocketCommands.DISCONNECT, connected: false }));

  connectionState$ = merge(
    this.connectionSuccess$,
    this.reconnectionSuccess$,
    this.reconnectionAttempt$,
    this.reconnectionError$,
    this.connectionError$,
    this.disconnection$,
    this.reconnectionFail$,
    this.connectionTimeOut$,
  ).pipe(
    doLog('connectionState$', true),
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
        tap(([{ command, payload }]) => console.log('emitCommannd', command, payload)),
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
      doLog('listenForEvent', true),
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
