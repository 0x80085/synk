import { Injectable } from '@angular/core';
import { filter, map, shareReplay } from 'rxjs/operators';

import { SocketService } from '../../socket.service';
import { AddMediaExceptionEvent, MediaEvent } from './models/room.models';
import { MediaCommands } from './models/media.models';
import { SocketCommands } from './models/commands.enum';

export interface PlaylistRepresentation {
  id: string;
  name: string;
  entries: MediaRepresentation[];
  nowPlaying: MediaRepresentation;
}

export class MediaRepresentation {
  title: string;
  url: string;
  length: number;
}

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  roomPlaylistUpdateEvents$ = this.socketService.listenForEvent<PlaylistRepresentation>(MediaCommands.PLAYLIST_UPDATE)
    .pipe(
      shareReplay(1)
    );

  roomMediaEvent$ = this.socketService.listenForEvent<MediaEvent>(MediaCommands.MEDIA_EVENT);

  addMediaErrEvent$ = this.socketService.listenForEvent<AddMediaExceptionEvent>(SocketCommands.EXCEPTION)
    .pipe(
      filter(({ message }) => message === "AddMediaException")
    );

  addMediaSuccessEvent$ = this.socketService.listenForEvent<any>(MediaCommands.ADD_MEDIA_REQUEST_APPROVED)
    .pipe(
      map((mediaUrl) => mediaUrl)
    );

  constructor(private socketService: SocketService) { }

  sendMediaEvent(ev: MediaEvent) {
    this.socketService.socket.emit(MediaCommands.MEDIA_EVENT, ev);
  }

  addToPlaylist(ev: MediaEvent) {
    this.socketService.socket.emit(MediaCommands.ADD_MEDIA, ev);
  }

  playNext(roomName: string) {
    this.socketService.socket.emit(MediaCommands.PLAY_NEXT_MEDIA, roomName);
  }

  shufflePlaylist(roomName: string) {
    this.socketService.socket.emit(MediaCommands.SHUFFLE_PLAYLIST, roomName);
  }

  removeFromPlaylist(ev: MediaEvent) {
    this.socketService.socket.emit(MediaCommands.REMOVE_MEDIA, ev);
  }
}
