import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SocketService } from '../../socket.service';
import { MediaEvent } from './models/room.models';
import { MediaCommands } from './models/media.models';
import { map } from 'rxjs/operators';

export type PlaylistItem = MediaEvent & { active: boolean };

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  roomPlaylist$ = this.socketService.listenForEvent<PlaylistItem[]>(MediaCommands.PLAYLIST_UPDATE).pipe(
    map((data: PlaylistItem[]) => {
      return data;
    })
  );

  roomMediaEvent$ = this.socketService.listenForEvent(MediaCommands.MEDIA_EVENT).pipe(
    map((data: MediaEvent) => {
      return data;
    })
  );

  constructor(private socketService: SocketService) { }

  sendMediaEvent(ev: MediaEvent) {
    this.socketService.socket.emit(MediaCommands.MEDIA_EVENT, ev);
  }

  addToPlaylist(ev: MediaEvent) {
    this.socketService.socket.emit(MediaCommands.ADD_MEDIA, ev);
  }

  removeFromPlaylist(ev: MediaEvent) {
    this.socketService.socket.emit(MediaCommands.REMOVE_MEDIA, ev);
  }
  // removeFromPlaylist(ev: MediaEvent) {
  //   this.socketService.sendEvent({ command: MediaCommands.REMOVE_MEDIA, payload: ev });
  // }
}
