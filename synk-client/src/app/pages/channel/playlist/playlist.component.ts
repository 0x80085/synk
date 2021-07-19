import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { ChatService } from '../chat.service';
import { MediaService } from '../media.service';
import { MediaEvent } from '../models/room.models';


interface PlaylistItem {
  active: boolean;
  title: string;
  mediaUrl: string;
}

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnDestroy {

  @Input() roomName: string;

  @Output() playMedia = new EventEmitter<MediaEvent>();

  mediaUrlInput: string;
  showControls: boolean;

  virtualPlaylist$: Observable<PlaylistItem[]> = this.mediaService.roomPlaylistUpdateEvents$.pipe(
    map(({ entries, nowPlaying }) =>
      entries
        .map(it => ({
          ...it,
          mediaUrl: it.url,
          active: it.url === nowPlaying.url
        }))
    ),
  );

  isLeader$ = this.chatService.roomUserConfig$.pipe(
    map(conf => conf.isLeader),
  );

  errorFeedback$ = this.mediaService.addMediaErrEvent$.pipe(
    tap(_ => this.notification.error('Error', `Couldnt add media to playlist...`))
  ).subscribe();

  succesFeedback$ = this.mediaService.addMediaSuccessEvent$.pipe(
    tap(_ => this.notification.success('Media added!', `Request to add media to playlist succeeded!`))
  ).subscribe();

  constructor(
    private mediaService: MediaService,
    private chatService: ChatService,
    private notification: NzNotificationService) { }

  onAddMedia() {
    if (!this.mediaUrlInput) {
      return;
    }

    this.mediaService.addToPlaylist({
      mediaUrl: this.mediaUrlInput,
      roomName: this.roomName,
      currentTime: null
    });
    this.mediaUrlInput = '';
    this.notification.info('Request Submitted', 'The request to add media to the current list is in progress. You will be updated if the request was (un)succesful'); // we dunno if that happened
  }

  onRemoveMedia(mediaUrl: string) {
    if (confirm(`Want to delete ${mediaUrl}?`)) {
      this.mediaService.removeFromPlaylist({
        mediaUrl,
        roomName: this.roomName,
        currentTime: null
      });
      this.notification.success('Success', 'Media removed from playlist');
    }
  }

  onNext() {
    this.mediaService.playNext(this.roomName);
  }

  onShuffle() {
    this.mediaService.shufflePlaylist(this.roomName);
  }

  ngOnDestroy(): void {
    this.errorFeedback$.unsubscribe();
    this.succesFeedback$.unsubscribe();
  }
}
