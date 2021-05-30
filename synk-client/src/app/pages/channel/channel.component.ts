import { Component, HostListener, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BehaviorSubject, iif, merge, noop, Observable, of, Subscription, timer } from 'rxjs';
import { mapTo, startWith, tap, shareReplay, take, filter, map, mergeMap, catchError, withLatestFrom, switchMap } from 'rxjs/operators';

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

  mediaSyncEventSubscription = this.mediaService.roomMediaEvent$.pipe(
    mergeMap((event) =>
      iif(
        () => !this.loggedInUserIsLeader,
        of(noop()),
        of(event).pipe(
          withLatestFrom(this.activeItem$),
          tap(([event, nowPlaying]) => this.syncPlayer(event, nowPlaying))
        )
      )))
    .subscribe();

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
      filter(it => !!it),
    ).subscribe(it => {
      const i = this.playlist.findIndex(url => it === url);
      const next = this.playlist[i + 1] || this.playlist[0];

      this.activeItemSubject.next(next);

      this.player.play(next);
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
      const mediaUrl = this.player.getCurrentUrl();
      this.activeItemSubject.next(mediaUrl);
      this.mediaService.sendMediaEvent({
        mediaUrl,
        currentTime: this.player.getCurrentTime(),
        roomName: this.name
      });
    } catch (error) {
      console.log(error);
      console.log('Player may not be loaded yet', error);
    }
  }

  private syncPlayer(ev: MediaEvent, nowPlayingUrl: string) {
    const shouldSyncPlayer = nowPlayingUrl !== ev.mediaUrl ||
      this.isCurrentTimeOutOfSync(ev.currentTime)

    if (shouldSyncPlayer) {
      console.log('syncing...');
      if (!this.player.isPlaying()) {
        this.player.play(ev.mediaUrl);
      }
      if (nowPlayingUrl !== ev.mediaUrl) {
        this.activeItemSubject.next(ev.mediaUrl);
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
