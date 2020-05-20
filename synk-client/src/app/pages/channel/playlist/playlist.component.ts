import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd';

import { MediaEvent } from '../models/room.models';
import { ChatService } from '../chat.service';
import { isValidYTid } from '../media/youtube/youtube.component';
import { MediaService, PlaylistItem } from '../media.service';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {

  @Input() roomName: string;
  @Input() showAddMediaInput = true;

  @Output() playMedia = new EventEmitter<MediaEvent>();

  newMedia: string;

  virtualPlaylist$: Observable<PlaylistItem[]> = this.mediaService.roomPlaylist$;

  showControls = false;

  constructor(
    private mediaService: MediaService,
    private notification: NzNotificationService) { }

  ngOnInit() {
  }

  onAddMedia() {
    if (!this.newMedia) {
      return;
    }
    if (!isValidYTid(this.newMedia)) {
      this.notification.error('Invalid input', ` That's not valid YouTube video URL...`);
      return;
    }

    this.mediaService.addToPlaylist({
      mediaUrl: this.newMedia,
      roomName: this.roomName,
      currentTime: null
    });
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

}
