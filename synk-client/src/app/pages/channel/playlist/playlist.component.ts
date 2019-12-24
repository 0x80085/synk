import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { MediaEvent } from '../models/room.models';
import { ChatService } from '../chat.service';
import { isValidYTid } from '../media/youtube/youtube.component';
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {

  @Input() playlist$: Observable<MediaEvent[]>;
  @Input() roomName: string;
  @Input() showAddMediaInput = true;

  @Output() playMedia = new EventEmitter<MediaEvent>();

  newMedia: string;


  constructor(
    private chatService: ChatService,
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

    const enw: MediaEvent = {
      mediaUrl: this.newMedia,
      roomName: this.roomName,
      currentTime: null
    };

    this.chatService.addToPlaylist(enw);
    this.notification.success('Success', 'Media added to playlist');
  }

}
