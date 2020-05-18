import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SocketService } from '../../socket.service';
import { MediaEvent } from './models/room.models';
import { MediaCommands } from './models/media.models';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  // roomPlaylist$: Observable<MediaEvent[]> = new Observable(observer => {
  //   this.socketService.on('playlist update', (data: MediaEvent[]) => {
  //     observer.next(data);
  //   });
  // });
  // roomMediaEvent$: Observable<MediaEvent> = new Observable(observer => {
  //   this.socketService.on('media event', (data: MediaEvent) => {
  //     observer.next(data);
  //   });
  // });

  roomPlaylist$ = this.socketService.listenForEventIfConnected(MediaCommands.PLAYLIST_UPDATE).pipe(
    map((data: MediaEvent[]) => {
      return data;
    })
  );

  roomMediaEvent$ = this.socketService.listenForEventIfConnected(MediaCommands.MEDIA_EVENT).pipe(
    map((data: MediaEvent) => {
      return data;
    })
  );

  constructor(private socketService: SocketService) { }

  sendMediaEvent(obs: Observable<{ mediaUrl: string, currentTime: number, roomName: string }>) {
    return this.socketService.emitIfConnected(obs)
      .subscribe(({ socket, data: { mediaUrl, roomName, currentTime, } }) => {
        const ev: MediaEvent = {
          currentTime,
          mediaUrl,
          roomName
        };
        socket.emit(MediaCommands.MEDIA_EVENT, ev);
      });
  }

  // sendMediaEvent(mediaUrl: string, currentTime: number, roomName: string) {
  //   const ev: MediaEvent = {
  //     currentTime,
  //     mediaUrl,
  //     roomName
  //   };
  //   this.socketService.sendEvent({ command: MediaCommands.MEDIA_EVENT, payload: ev });
  // }

  addToPlaylist(obs: Observable<MediaEvent>) {
    return this.socketService.emitIfConnected(obs)
      .subscribe(({ socket, data }) => {
        socket.emit(MediaCommands.ADD_MEDIA, data);
      });
  }

  // addToPlaylist(ev: MediaEvent) {
  //   this.socketService.sendEvent({ command: MediaCommands.ADD_MEDIA, payload: ev });
  // }

  removeFromPlaylist(obs: Observable<MediaEvent>) {
    return this.socketService.emitIfConnected(obs)
      .subscribe(({ socket, data }) => {
        socket.emit(MediaCommands.REMOVE_MEDIA, data);
      });
  }
  // removeFromPlaylist(ev: MediaEvent) {
  //   this.socketService.sendEvent({ command: MediaCommands.REMOVE_MEDIA, payload: ev });
  // }
}