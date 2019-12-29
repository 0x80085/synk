import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable, merge, combineLatest, of } from 'rxjs';
import { MediaEvent } from '../models/room.models';
import { ChatService } from '../chat.service';
import { isValidYTid } from '../media/youtube/youtube.component';
import { NzNotificationService, isTemplateRef } from 'ng-zorro-antd';
import { map, switchMap, tap, withLatestFrom, startWith } from 'rxjs/operators';

type ListItem = MediaEvent & { active: boolean };

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {

  @Input() playlist$: Observable<MediaEvent[]>;
  @Input() activeItem = '';
  @Input() roomName: string;
  @Input() showAddMediaInput = true;

  @Output() playMedia = new EventEmitter<MediaEvent>();

  newMedia: string;

  virtualPlaylist$: Observable<ListItem[]>;

  constructor(
    private chatService: ChatService,
    private notification: NzNotificationService) { }

  ngOnInit() {
    this.createVirtualList();
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

  private createVirtualList() {
    this.virtualPlaylist$ = this.playlist$.pipe(
      withLatestFrom(of(this.activeItem)),
      map(([ls, a]) => {
        const e: ListItem[] = ls.map(it => {
          const active = it.mediaUrl === a;
          return { ...it, active };
        });
        console.log(e);

        return e;
      })
    );

  }

}
