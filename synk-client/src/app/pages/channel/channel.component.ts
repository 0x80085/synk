import { Component, OnInit, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { tap, map, mapTo } from 'rxjs/operators';
import { timer, Subscription, Observable } from 'rxjs';

import { MediaComponent } from './media/media.component';
import { ChatService } from './chat.service';
import { MediaEvent, Message, RoomUserDto } from './models/room.models';
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss']
})
export class ChannelComponent implements OnInit, OnDestroy {

  @ViewChild('player', { static: false }) player: MediaComponent;

  name: string;
  mediaUrl = '';
  isLeader = false;

  mediaUpdateTimer$: Subscription;
  mediaSyncEvent$: Subscription;
  errorEvent$: Observable<Message[]>;
  members$: Observable<RoomUserDto[]>;
  roomUserConfig$: Subscription;
  playlist$: Observable<MediaEvent[]>;

  playlist: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private notification: NzNotificationService
  ) { }

  @HostListener('window:beforeunload')
  exitRoomOnPageDestroy() {
    this.chatService.exit(this.name);
  }

  ngOnInit() {
    this.name = this.route.snapshot.paramMap.get('name');
    this.chatService.reconnect();
    this.syncPlayerState();
    this.sendPeriodicUpdate();
    this.quitOnError();
    this.receiveRoomConfig();
    this.receivePlaylistUpdate();
    this.receiveMemberlistUpdate();
  }

  onVideoEnded() {
    const i = this.playlist.findIndex(it => it === this.mediaUrl);
    const next = this.playlist[i + 1] || this.playlist[0];
    this.mediaUrl = next;

    this.player.play(this.mediaUrl);
  }

  sendPeriodicUpdate() {
    const timer$ = timer(1000, 2000);
    this.mediaUpdateTimer$ = timer$.subscribe(val => {
      if (this.isLeader && this.player) {
        this.sendMediaUpdate();
      }
    });
  }

  syncPlayerState() {
    this.mediaSyncEvent$ = this.chatService.roomMediaEvent$.subscribe(ev => {
      if (!this.isLeader) {
        this.syncPlayer(ev);
      }
    });
  }

  receiveRoomConfig() {
    this.roomUserConfig$ = this.chatService.roomUserConfig$.subscribe(ev => {
      this.isLeader = ev.isLeader;
      console.log(ev);
    });
  }

  receivePlaylistUpdate() {
    this.playlist$ = this.chatService.roomPlaylist$.pipe(
      tap(ev => {
        this.playlist = ev.map(i => {
          return i.mediaUrl;
        });
      })
    );
  }

  receiveMemberlistUpdate() {
    this.members$ = this.chatService.roomUserList$.pipe(
      tap(ev => {
        console.log('roomUserList update', ev);
      })
    );
  }

  quitOnError() {
    this.errorEvent$ = this.chatService.permissionErrorEvent$.pipe(
      tap(x => {
        console.log(x);

        this.notification.error('Hmm.. Something went wrong here', 'Maybe try logging in again?');

        this.mediaUpdateTimer$.unsubscribe();
        this.mediaSyncEvent$.unsubscribe();
      })
    );
  }

  private sendMediaUpdate() {
    try {
      this.chatService.sendMediaEvent(
        this.player.getCurrentUrl(),
        this.player.getCurrentTime(),
        this.name
      );
      this.mediaUrl = this.player.getCurrentUrl();

    } catch (error) {
      console.log('Player may not be loaded yet', error);
    }
  }

  private syncPlayer(ev: MediaEvent) {
    if (!this.shouldSyncPlayer(ev)) {
      return;
    }

    try {
      console.log('syncing...');
      if (this.player.getCurrentUrl() !== ev.mediaUrl) {
        this.mediaUrl = ev.mediaUrl;
        this.player.play(this.mediaUrl);
      }
      if (this.clientCurrenttimeIsOutOfSync(ev.currentTime)) {
        if (!this.player.isPlaying()) {
          this.player.play(ev.mediaUrl);
          return;
        }
        this.player.seek(ev.currentTime);
      }
    } catch (error) {
      console.log('Error while syncing player - probably not ready yet');
      console.log(error);
    }
  }

  private shouldSyncPlayer(ev: MediaEvent) {
    return (
      this.mediaUrl !== ev.mediaUrl ||
      this.clientCurrenttimeIsOutOfSync(ev.currentTime)
    );
  }

  private clientCurrenttimeIsOutOfSync(originTime: number) {
    try {
      if (typeof originTime !== 'number') {
        return false;
      }
      const clientTime = this.player.getCurrentTime();
      const maxTimeBehind = originTime - 2;
      const maxTimeAhead = originTime + 2;
      const isOutOfSync =
        clientTime < maxTimeBehind || clientTime > maxTimeAhead;

      console.log(
        `
        Client time:\t${clientTime}
        Client URL:\t${this.mediaUrl}
        maxTimeBehind :\t${maxTimeBehind}
        maxTimeAhead :\t${maxTimeAhead}
        Leader time:\t${originTime}

        client out of sync:\t${isOutOfSync}
        client behind :\t${clientTime < maxTimeBehind}
        maxTimeAhead :\t${clientTime > maxTimeAhead}
        `
      );

      return isOutOfSync;
    } catch (error) {
      console.log(error.toString && error.toString());
      return false;
    }
  }

  ngOnDestroy(): void {
    this.mediaUpdateTimer$.unsubscribe();
    this.mediaSyncEvent$.unsubscribe();
    this.chatService.exit(this.name);
  }
}
