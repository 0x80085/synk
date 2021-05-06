import { Component, HostListener, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BehaviorSubject, merge, Observable, Subscription, timer } from 'rxjs';
import { mapTo, startWith, tap, shareReplay, take, filter } from 'rxjs/operators';

import { SocketService } from '../../socket.service';
import { ChatService } from './chat.service';
import { MediaService, PlaylistRepresentation } from './media.service';
import { MediaComponent } from './media/media.component';
import { MediaEvent, RoomUser } from './models/room.models';
import { AppStateService } from '../../app-state.service';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss']
})
export class ChannelComponent implements OnInit, OnDestroy {

  @ViewChild('player', { static: false }) player: MediaComponent;

  playlist: string[] = [];

  name: string;
  nowPlayingUrl: string;
  loggedInUserIsLeader = false;

  activeItemSubject: BehaviorSubject<string> = new BehaviorSubject(null);
  activeItem$ = this.activeItemSubject.pipe(shareReplay(1));

  isConnected$ = merge(this.socketService.isConnected$, this.state.isLoggedIn$);

  isLoading$ = merge(
    this.socketService.reconnectionError$.pipe(mapTo(true)),
    this.isConnected$.pipe(mapTo(false)),
  )
    .pipe(
      startWith(false)
    );

  members$: Observable<RoomUser[]> = this.chatService.roomUserList$;

  playlist$: Observable<PlaylistRepresentation> = this.mediaService.roomPlaylistUpdateEvents$;

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
  });

  errorEventSubscription = this.socketService.connectionError$.pipe(
    tap(x => {
      this.notification.error('Hmm.. Something went wrong here', 'Maybe try logging in again?');
      this.mediaUpdateTimerSubscription.unsubscribe();
      this.mediaSyncEventSubscription.unsubscribe();
    })).subscribe();


  constructor(
    private route: ActivatedRoute,
    private socketService: SocketService,
    private state: AppStateService,
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
    this.activeItem$.pipe(
      filter(it => it !== null),
      take(1)
    ).subscribe(it => {
      const i = this.playlist.findIndex(url => it === url);
      const next = this.playlist[i + 1] || this.playlist[0];

      this.nowPlayingUrl = next;
      this.activeItemSubject.next(this.nowPlayingUrl);

      this.player.play(this.nowPlayingUrl);
    });
  }


  giveLeader(member: RoomUser) {
    this.chatService.giveLeader({ member, roomName: this.name });
  }

  private sendMediaUpdate() {
    try {
      const isPaused = !this.player.isPlaying();
      if (isPaused) {
        // Dont update when leader paused video.
        return;
      }
      this.nowPlayingUrl = this.player.getCurrentUrl();
      this.activeItemSubject.next(this.nowPlayingUrl);
      this.mediaService.sendMediaEvent({
        mediaUrl: this.nowPlayingUrl,
        currentTime: this.player.getCurrentTime(),
        roomName: this.name
      });
    } catch (error) {
      console.log(error);
      console.log('Player may not be loaded yet', error);
    }
  }

  private syncPlayer(ev: MediaEvent) {
    if (this.shouldSyncPlayer(ev)) {
      console.log('syncing...');
      if (!this.player.isPlaying()) {
        this.player.play(ev.mediaUrl);
      }
      if (this.nowPlayingUrl !== ev.mediaUrl) {
        this.nowPlayingUrl = ev.mediaUrl;
        this.activeItemSubject.next(this.nowPlayingUrl);
      }
      try {
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
  }

  private shouldSyncPlayer(ev: MediaEvent) {
    return (
      this.nowPlayingUrl !== ev.mediaUrl ||
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

      // console.log(
      //   `
      //   Client time:\t${clientTime}
      //   Client URL:\t${this.nowPlayingUrl}
      //   maxTimeBehind :\t${maxTimeBehind}
      //   maxTimeAhead :\t${maxTimeAhead}
      //   Leader time:\t${originTime}

      //   client out of sync:\t${isOutOfSync}
      //   client behind :\t${clientTime < maxTimeBehind}
      //   maxTimeAhead :\t${clientTime > maxTimeAhead}
      //   `
      // );

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
