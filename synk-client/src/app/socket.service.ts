import { Injectable } from '@angular/core';
import { Observable, of, fromEvent, merge } from 'rxjs';
import * as io from 'socket.io-client';

import { environment } from '../environments/environment';
import { switchMap, map, tap, share, withLatestFrom, catchError, mapTo, shareReplay } from 'rxjs/operators';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PossibleCommands } from './pages/channel/models/commands.enum';
import { doLog } from './utils/custom.operators';

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
    share()
  );

  connectionSuccess$ = this.listenForEvent('connect').pipe(mapTo({ event: 'connect', connected: true }));

  reconnectionSuccess$ = this.listenForEvent('reconnect').pipe(mapTo({ event: 'reconnect', connected: true }));
  reconnectionAttempt$ = this.listenForEvent('reconnect_attempt').pipe(mapTo({ event: 'reconnect_attempt', connected: false }));
  reconnectionError$ = this.listenForEvent('reconnect_error').pipe(mapTo({ event: 'reconnect_error', connected: false }));
  reconnectionFail$ = this.listenForEvent('reconnect_failed').pipe(mapTo({ event: 'reconnect_failed', connected: false }));

  connectionError$ = this.listenForEvent('error').pipe(mapTo({ event: 'error', connected: false }));
  connectionTimeOut$ = this.listenForEvent('connect_timeout').pipe(mapTo({ event: 'connect_timeout', connected: false }));

  permissionError$ = this.listenForEvent('exception').pipe(map(({ message }) => message as string));
  // should prob be more like  this.socketService.listenForEvent<AddMediaExceptionEvent>(SocketCommands.EXCEPTION).pipe(filter(({ message }) => message === "AddMediaException")

  disconnection$ = this.listenForEvent('disconnect').pipe(mapTo({ event: 'disconnect', connected: false }));

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
