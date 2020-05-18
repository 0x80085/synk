import { Injectable, Inject, forwardRef } from '@angular/core';
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

  constructor(@Inject(forwardRef(() => SocketService)) private socketService: SocketService) { }


  sendMediaEvent(mediaUrl: string, currentTime: number, roomName: string) {
    const ev: MediaEvent = {
      currentTime,
      mediaUrl,
      roomName
    };
    this.socketService.sendEvent({ command: MediaCommands.MEDIA_EVENT, payload: ev });
  }

  addToPlaylist(ev: MediaEvent) {
    this.socketService.sendEvent({ command: MediaCommands.ADD_MEDIA, payload: ev });
  }

  removeFromPlaylist(ev: MediaEvent) {
    this.socketService.sendEvent({ command: MediaCommands.REMOVE_MEDIA, payload: ev });
  }
}
