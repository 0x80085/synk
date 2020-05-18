import { Component, OnInit, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { tap, map, mapTo } from 'rxjs/operators';
import { timer, Subscription, Observable, BehaviorSubject } from 'rxjs';

import { MediaComponent } from './media/media.component';
import { ChatService } from './chat.service';
import { MediaEvent, Message, RoomUserDto } from './models/room.models';
import { NzNotificationService } from 'ng-zorro-antd';
import { MediaService } from './media.service';
import { SocketService } from 'src/app/socket.service';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss']
})
export class ChannelComponent implements OnInit, OnDestroy {

  @ViewChild('player', { static: false }) player: MediaComponent;

  name: string;
  mediaUrl = '';
  loggedInUserIsLeader = false;

  activeItemSubject: BehaviorSubject<string> = new BehaviorSubject(null);

  errorEvent$: Observable<Message>;
  members$: Observable<RoomUserDto[]>;
  playlist$: Observable<MediaEvent[]>;

  mediaUpdateTimerSubscription: Subscription;
  mediaSyncEventSubscription: Subscription;
  roomUserConfigSubscription: Subscription;

  playlist: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private socketService: SocketService,
    private chatService: ChatService,
    private mediaService: MediaService,
    private notification: NzNotificationService
  ) { }

  @HostListener('window:beforeunload')
  exitRoomOnPageDestroy() {
    this.chatService.exit(this.name);
  }

  ngOnInit() {
    this.name = this.route.snapshot.paramMap.get('name');
    this.socketService.reconnect();
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
    this.activeItemSubject.next(this.mediaUrl)

    this.player.play(this.mediaUrl);
  }

  sendPeriodicUpdate() {
    const timer$ = timer(1000, 2000);
    this.mediaUpdateTimerSubscription = timer$.subscribe(val => {
      if (this.loggedInUserIsLeader && this.player) {
        this.sendMediaUpdate();
      }
    });
  }

  syncPlayerState() {
    this.mediaSyncEventSubscription = this.mediaService.roomMediaEvent$.subscribe(ev => {
      if (!this.loggedInUserIsLeader) {
        this.syncPlayer(ev);
      }
    });
  }

  receiveRoomConfig() {
    this.roomUserConfigSubscription = this.chatService.roomUserConfig$.subscribe(ev => {
      this.loggedInUserIsLeader = ev.isLeader;
      console.log(ev);
    });
  }

  receivePlaylistUpdate() {
    this.playlist$ = this.mediaService.roomPlaylist$.pipe(
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
    this.errorEvent$ = this.socketService.permissionErrorEvent$.pipe(
      tap(x => {
        console.log(x);

        this.notification.error('Hmm.. Something went wrong here', 'Maybe try logging in again?');

        this.mediaUpdateTimerSubscription.unsubscribe();
        this.mediaSyncEventSubscription.unsubscribe();
      })
    );
  }

  giveLeader(member: RoomUserDto) {
    this.chatService.giveLeader(member, this.name);
  }

  private sendMediaUpdate() {
    try {
      this.mediaService.sendMediaEvent(
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
        this.activeItemSubject.next(this.mediaUrl)
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
    this.mediaUpdateTimerSubscription.unsubscribe();
    this.mediaSyncEventSubscription.unsubscribe();
    this.chatService.exit(this.name);
  }
}
