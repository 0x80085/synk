import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BehaviorSubject, combineLatest, merge, noop, Observable, of, Subscription, timer } from 'rxjs';
import { map, mapTo, shareReplay, startWith, switchMap, take, tap } from 'rxjs/operators';

import { AppStateService } from '../../app-state.service';
import { SocketService } from '../../socket.service';
import { ChatService } from './chat.service';
import { MediaService, PlaylistRepresentation } from './media.service';
import { MediaComponent } from './media/media.component';
import { MediaEvent, RoomUser } from './models/room.models';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss']
})
export class ChannelComponent implements OnInit, OnDestroy {

  @ViewChild('player', { static: false }) player: MediaComponent;

  name: string;

  loggedInUserIsLeader = false;

  activeItemSubject: BehaviorSubject<string> = new BehaviorSubject(null);
  activeItem$ = this.activeItemSubject.pipe(shareReplay(1));

  isConnected$ = merge(this.socketService.isConnected$, this.state.isLoggedIn$);

  isLoading$ = merge(
    this.socketService.reconnectionError$.pipe(mapTo(true)),
    this.isConnected$.pipe(mapTo(false)),
  ).pipe(startWith(false));

  members$: Observable<RoomUser[]> = this.chatService.roomUserList$;

  playlist$: Observable<PlaylistRepresentation> = this.mediaService.roomPlaylistUpdateEvents$;

  isLeader$ = this.chatService.roomUserConfig$.pipe(
    map(conf => conf.isLeader),
  );

  alreadyJoinedRoomError$ = this.chatService.alreadyJoinedRoomError$;

  mediaUpdateTimerSubscription: Subscription = timer(1000, 2000).subscribe(val => {
    if (this.loggedInUserIsLeader && this.player) {
      this.sendMediaUpdate();
    }
  });

  mediaSyncEventSubscription = this.mediaService.roomMediaEvent$.pipe(
    switchMap((event) =>
      this.loggedInUserIsLeader
        ? of(noop())
        : of(event).pipe(
          tap((event) => this.syncPlayer(event, this.player.getCurrentUrl()))
        )))
    .subscribe();

  roomUserConfigSubscription = this.chatService.roomUserConfig$.subscribe(ev => {
    this.loggedInUserIsLeader = ev.isLeader;
  });

  isUserLeaderFeedbackSubscription = merge(
    this.chatService.userBecameLeader$.pipe(mapTo(true)),
    this.chatService.userPassedOnLeader$.pipe(mapTo(false))
  ).pipe(
    tap(isLeader => {
      const msgs = {
        forNewLeader: {
          title: `You are now the leader of the room!`,
          body: `You have control over the video player of the room now. Try playing a video and others will hook into your playback time`
        },
        forExLeader: {
          title: `Leadership given up successfully!`,
          body: `You have given up control. Another user controls the playback now`
        }
      }

      this.notification.success(
        isLeader
          ? msgs.forNewLeader.title
          : msgs.forExLeader.title,
        isLeader
          ? msgs.forNewLeader.body
          : msgs.forExLeader.body,
      )
    })
  ).subscribe()

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
    combineLatest([this.activeItem$, this.playlist$])
      .pipe(take(1)) // if needed - maybe not
      .subscribe(([nowPlayingUrl, { entries }]) => {
        const i = entries.findIndex(entry => entry.url === nowPlayingUrl);
        const next = entries[i + 1] || entries[0];

        this.activeItemSubject.next(next.url);

        this.player.play(next.url);
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

  private syncPlayer({ currentTime, mediaUrl }: MediaEvent, nowPlayingUrl: string) {

    const shouldSyncPlayer = nowPlayingUrl !== mediaUrl ||
      this.isCurrentTimeOutOfSync(currentTime)

    if (shouldSyncPlayer) {
      if (!this.player.isPlaying()) {
        this.player.play(mediaUrl);
      }
      if (nowPlayingUrl !== mediaUrl) {
        this.player.play(mediaUrl)
        this.activeItemSubject.next(mediaUrl);
      }
      try {
        if (this.isCurrentTimeOutOfSync(currentTime)) {
          if (!this.player.isPlaying()) {
            this.player.play(mediaUrl);
            return;
          }
          this.player.seek(currentTime);
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
    this.isUserLeaderFeedbackSubscription.unsubscribe();
    this.chatService.exit(this.name);
  }
}
