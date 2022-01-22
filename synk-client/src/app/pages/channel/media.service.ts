import { Injectable } from '@angular/core';
import { filter, map, share, shareReplay } from 'rxjs/operators';

import { SocketService } from '../../socket.service';
import { MediaEvent } from './models/room.models';
import { MediaCommands } from './models/media.models';
import { debugLog } from 'src/app/utils/custom.operators';

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

  roomMediaEvent$ = this.socketService
    .listenForEvent<MediaEvent>(MediaCommands.MEDIA_EVENT)
    .pipe(
      shareReplay(1)
    );

  addMediaErrEvent$ = this.socketService.exceptionEvent$
    .pipe(
      filter(({ message }) => message === "AddMediaException")
    );

  addMediaSuccessEvent$ = this.socketService.listenForEvent<{ url: string, playlistCount: number }>(MediaCommands.ADD_MEDIA_REQUEST_APPROVED)
    .pipe(
      map((mediaUrl) => mediaUrl)
    );

  removeMediaErrEvent$ = this.socketService.exceptionEvent$
    .pipe(
      filter(({ message }) => message === "forbidden")
    );

  removeMediaSuccessEvent$ = this.socketService.listenForEvent<{ mediaUrl: string }>(MediaCommands.REMOVE_MEDIA_SUCCESS)
    .pipe(
      map((mediaUrl) => mediaUrl)
    );

  onVoteSkipCountEvent$ = this.socketService.listenForEvent<{ count: number, max: number }>(MediaCommands.VOTE_SKIP_COUNT);

  constructor(private socketService: SocketService) { }

  sendMediaEvent(ev: MediaEvent) {
    debugLog('sendMediaEvent', ev, true)
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

  voteSkip(roomName: string) {
    this.socketService.socket.emit(MediaCommands.VOTE_SKIP, roomName);
  }

  updateVoteSkipRatio(name: string, ratio: number) {
    this.socketService.socket.emit(MediaCommands.UPDATE_VOTE_SKIP_RATIO, { name, ratio });
  }

  changePositionInPlaylist(ev: { roomName: string, mediaUrl: string, newPosition: number }) {
    this.socketService.socket.emit(MediaCommands.CHANGE_MEDIA_POSITION_IN_LIST, ev);
  }

  reportMediaNotPlayable(ev: { roomName: string, mediaUrl: string }) {
    this.socketService.socket.emit(MediaCommands.MEDIA_NOT_PLAYBLE, ev);
  }
}
