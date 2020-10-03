import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd';

import { MediaEvent } from '../models/room.models';
import { ChatService } from '../chat.service';
import { MediaService, PlaylistItem } from '../media.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {

  @Input() roomName: string;

  @Output() playMedia = new EventEmitter<MediaEvent>();

  mediaUrlInput: string;
  showControls: boolean;

  virtualPlaylist$: Observable<PlaylistItem[]> = this.mediaService.roomPlaylist$;
  isLeader$ = this.chatService.roomUserConfig$.pipe(
    map(conf => conf.isLeader),
  );

  constructor(
    private mediaService: MediaService,
    private chatService: ChatService,
    private notification: NzNotificationService) { }

  ngOnInit() {
  }

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
    this.notification.success('Success', 'Media added to playlist');
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
}
