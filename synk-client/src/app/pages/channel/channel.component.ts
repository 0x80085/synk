import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import { BehaviorSubject, merge, Observable, Subscription, timer } from 'rxjs';
import { mapTo, startWith, tap } from 'rxjs/operators';

import { SocketService } from 'src/app/socket.service';
import { ChatService } from './chat.service';
import { MediaService } from './media.service';
import { MediaComponent } from './media/media.component';
import { MediaEvent, RoomUserDto } from './models/room.models';

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

  isConnected$ = this.socketService.isConnected$;

  isLoading$ = this.isConnected$
    .pipe(
      mapTo(false)
    )
    .pipe(
      startWith(true)
    );

  members$: Observable<RoomUserDto[]> = this.chatService.roomUserList$.pipe(
    tap(ev => {
      console.log('roomUserList update', ev);
    })
  );

  playlist$: Observable<MediaEvent[]> = this.mediaService.roomPlaylist$.pipe(
    tap(ev => {
      this.playlist = ev.map(i => {
        return i.mediaUrl;
      });
    }));

  mediaUpdateTimerSubscription: Subscription = timer(1000, 2000).subscribe(val => {
    if (this.loggedInUserIsLeader && this.player) {
      this.sendMediaUpdate();
    }
  });

  mediaSyncEventSubscription = this.mediaService.roomMediaEvent$.subscribe(ev => {
    if (!this.loggedInUserIsLeader) {
      this.syncPlayer(ev);
    }
  });

  roomUserConfigSubscription = this.chatService.roomUserConfig$.subscribe(ev => {
    this.loggedInUserIsLeader = ev.isLeader;
    console.log(ev);
  });

  errorEventSubscription = merge(
    this.socketService.connectionError$,
    this.socketService.permissionError$
  ).pipe(
    tap(x => {
      console.log(x);

      this.notification.error('Hmm.. Something went wrong here', 'Maybe try logging in again?');

      this.mediaUpdateTimerSubscription.unsubscribe();
      this.mediaSyncEventSubscription.unsubscribe();
    })).subscribe();

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
  }

  onVideoEnded() {
    const i = this.playlist.findIndex(it => it === this.mediaUrl);
    const next = this.playlist[i + 1] || this.playlist[0];
    this.mediaUrl = next;
    this.activeItemSubject.next(this.mediaUrl);

    this.player.play(this.mediaUrl);
  }


  giveLeader(member: RoomUserDto) {
    this.chatService.giveLeader({ member, roomName: this.name });
  }

  private sendMediaUpdate() {
    try {
      const isPaused = !this.player.isPlaying();
      if (isPaused) {
        // Dont update when leader paused video.
        return;
      }
      this.mediaService.sendMediaEvent({
        mediaUrl: this.player.getCurrentUrl(),
        currentTime: this.player.getCurrentTime(),
        roomName: this.name
      });
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
        this.activeItemSubject.next(this.mediaUrl);
      }
      if (this.isCurrentTimeOutOfSync(ev.currentTime)) {
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
      this.isCurrentTimeOutOfSync(ev.currentTime)
    );
  }

  private isCurrentTimeOutOfSync(originTime: number) {
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
    this.errorEventSubscription.unsubscribe();
    this.chatService.exit(this.name);
  }
}
