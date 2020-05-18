import { Injectable } from '@angular/core';
import { Observable, of, fromEvent } from 'rxjs';
import * as io from 'socket.io-client';

import { AppStateService } from 'src/app/app-state.service';
import { environment } from 'src/environments/environment';
import { Message } from './pages/channel/models/room.models';
import { PossibleCommands } from './pages/channel/models/commands.enum';
import { switchMap, map, tap } from 'rxjs/operators';

export interface RealTimeCommand {
  command: PossibleCommands;
  payload?: any;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  socket$ = of(io(`${environment.api}`));

  connectionSuccessEvent$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'connect')
          .pipe(
            map(() => socket),
            tap(() => this.setAppState(true, true))
          )
      )
    );

  permissionErrorEvent$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'error')
          .pipe(
            tap(() => {
              this.setAppState(false, false);
              this.socket.close();
            }),
            map((data: Message) => data)
          )
      )
    );

  connectionErrorEvent$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'error')
          .pipe(
            tap(() => {
              this.setAppState(false, false);
              this.socket.close();
            })
          )
      )
    );

  connectionTimeOutEvent$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'error')
          .pipe(
            tap(() => {
              this.setAppState(false);
              this.socket.close();
            })
          )
      )
    );

  disconnectionEvent$ = this.socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'error')
          .pipe(
            tap(() => {
              this.setAppState(false);
            })
          )
      )
    );

  constructor(private state: AppStateService) { }

  connect() {
    this.socket.connect();
  }

  reconnect() {
    this.socket.close();
    this.socket.open();
  }

  removeEventListener(name: string) {
    this.socket.off(name);
  }

  sendEvent(ev: RealTimeCommand) {
    this.socket.emit(ev.command, ev.payload);
  }

  // emitIfConnected(observable$) {
  //   return this.connectionSuccessEvent$
  //     .pipe(
  //       switchMap(socket =>
  //         observable$
  //           .pipe(
  //             map(data => ({ socket, data }))
  //           )
  //       )
  //     );
  // }

  listenForEventIfConnected(event: string) {
    return this.connectionSuccessEvent$
      .pipe(
        switchMap(socket =>
          fromEvent(socket, event)
        )
      );
  }

  private setAppState(isConnected: boolean, isLoggedIn?: boolean) {
    this.state.isSocketConnectedSub.next(isConnected);
    if (isLoggedIn) {
      this.state.isLoggedInSubject.next(isLoggedIn);
    }
  }
}
