import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
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

  localPlaylist: PlaylistItem[] = [];

  isLeader$ = this.chatService.roomUserConfig$.pipe(
    map(conf => conf.isLeader),
  );

  private virtualPlaylist$: Subscription = this.mediaService.roomPlaylistUpdateEvents$.pipe(
    map(({ entries, nowPlaying }) =>
      entries.map(entry => ({
        ...entry,
        mediaUrl: entry.url,
        active: nowPlaying ? entry.url === nowPlaying.url : false
      }))),
    tap(ls => this.localPlaylist = ls)
  ).subscribe();

  private addMediaErrorFeedback$ = this.mediaService.addMediaErrEvent$.pipe(
    tap(_ => this.notification.error('Error', `Couldnt add media to playlist...`))
  ).subscribe();

  private addMediaSuccesFeedback$ = this.mediaService.addMediaSuccessEvent$.pipe(
    tap(_ => this.notification.success('Media added!', `Request to add media to playlist succeeded!`))
  ).subscribe();

  private removeMediaErrorFeedback$ = this.mediaService.removeMediaErrEvent$.pipe(
    tap(_ => this.notification.error('Failed to remove media from playlist', `Only users who have added the entry can remove it`))
  ).subscribe();

  private removeMediaESuccesFeedback$ = this.mediaService.removeMediaSuccessEvent$.pipe(
    tap(_ => this.notification.success('Success', 'Media removed from playlist'))
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
    this.notification.info('Request Submitted', 'The request to add media to the current list is in progress. You will be updated if the request was (un)succesful');
  }

  onRemoveMedia(mediaUrl: string) {
    if (confirm(`Want to delete ${mediaUrl}?`)) {
      this.mediaService.removeFromPlaylist({
        mediaUrl,
        roomName: this.roomName,
        currentTime: null
      });
    }
  }

  drop(event: CdkDragDrop<string[]>): void {
    console.log('dropeed');
    console.log(event);

    const { currentIndex, previousIndex } = event
    if (currentIndex === previousIndex) {
      return
    }

    const movedMediaValue = this.localPlaylist[previousIndex];

    this.mediaService.changePositionInPlaylist({ roomName: this.roomName, mediaUrl: movedMediaValue.mediaUrl, newPosition: event.currentIndex })
  }

  onNext() {
    this.mediaService.playNext(this.roomName);
  }

  onShuffle() {
    this.mediaService.shufflePlaylist(this.roomName);
  }

  ngOnDestroy(): void {
    this.virtualPlaylist$.unsubscribe();

    this.addMediaErrorFeedback$.unsubscribe();
    this.addMediaSuccesFeedback$.unsubscribe();

    this.removeMediaESuccesFeedback$.unsubscribe();
    this.removeMediaErrorFeedback$.unsubscribe();
  }
}
