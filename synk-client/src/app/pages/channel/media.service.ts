import { Injectable } from '@angular/core';
import { filter, map, shareReplay } from 'rxjs/operators';

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
  duration: number;
  addedBy: { memberId: string, username: string };
  isLive: boolean;
  currentTime: number;
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
    .listenForEvent<MediaRepresentation>(MediaCommands.MEDIA_EVENT)
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

    clearPlaylistSuccessEvent$ = this.socketService.listenForEvent<unknown>(MediaCommands.CLEAR_PLAYLIST_SUCCESS);

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

  changePositionInPlaylist(ev: { roomName: string, url: string, newPosition: number }) {
    this.socketService.socket.emit(MediaCommands.CHANGE_MEDIA_POSITION_IN_LIST, ev);
  }

  reportMediaNotPlayable(ev: { roomName: string, url: string }) {
    this.socketService.socket.emit(MediaCommands.MEDIA_NOT_PLAYBLE, ev);
  }

  clearPlaylist(roomName: string) {
    this.socketService.socket.emit(MediaCommands.CLEAR_PLAYLIST, { roomName })
  }
}
