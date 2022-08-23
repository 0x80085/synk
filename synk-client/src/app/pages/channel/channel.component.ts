import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BehaviorSubject, merge, noop, Observable, of, Subject, Subscription, timer } from 'rxjs';
import { map, shareReplay, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { debugLog } from 'src/app/utils/custom.operators';


import { AppStateService } from '../../app-state.service';
import { SocketService } from '../../socket.service';
import { ChatService } from './chat.service';
import { MediaRepresentation, MediaService, PlaylistRepresentation } from './media.service';
import { MediaComponent } from './media/media.component';
import { RoomUser, RoomUserConfig } from './models/room.models';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss']
})
export class ChannelComponent implements OnInit, OnDestroy {

  @ViewChild('player', { static: false }) player: MediaComponent;

  name: string;

  loggedInUserIsLeader = false;

  activeItemSubject: BehaviorSubject<MediaRepresentation> = new BehaviorSubject(null);
  activeItem$: Observable<MediaRepresentation> = this.activeItemSubject.pipe(
    shareReplay(1)
  );

  mediaEndedSubject = new Subject();


  isConnected$ = merge(this.socketService.isConnected$, this.state.isLoggedInAndConnected$);
  isSuperAdmin$ = this.state.isAdmin$;

  isLoading$ = merge(
    this.socketService.reconnectionError$.pipe(map(() => true)),
    this.isConnected$.pipe(map(() => false)),
  ).pipe(startWith(false));

  members$: Observable<RoomUser[]> = this.chatService.roomUserList$;

  playlist$: Observable<PlaylistRepresentation> = this.mediaService.roomPlaylistUpdateEvents$;

  roomUserConfig$: Observable<RoomUserConfig> = this.chatService.roomUserConfig$.pipe(shareReplay(1))

  alreadyJoinedRoomError$ = this.chatService.alreadyJoinedRoomError$;
  roomFullRoomError$ = this.chatService.roomMaxMemberLimitReachedError$; // todo show feedback

  mediaUpdateTimerSubscription: Subscription = timer(1000, 2000)
    .pipe(
      withLatestFrom(this.activeItem$),
      tap(([, media]) => console.log('media update', media)),
      tap(([, media]) => {
        debugLog(`hasplayer? ${!!this.player?.ref}`,)
        if (this.loggedInUserIsLeader && this.player?.ref) {
          debugLog('mediaUpdateTimerSubscription going to sendMediaUpdate')
          this.sendMediaUpdate(media);
        }
      }),
    )
    .subscribe();

  mediaEndedSubscription: Subscription = this.mediaEndedSubject
    .pipe(
      withLatestFrom(this.playlist$),
      tap(([, { entries }]) => {
        try {
          console.log('onMediaEnded()');
          const nowPlayingUrl = this.player.getCurrentUrl();
          
          const i = entries.findIndex(entry => entry.url === nowPlayingUrl);
          const next = entries[i + 1] || entries[0];

          console.log('next', next);
          this.activeItemSubject.next(next);

          this.player.play(next.url);

        } catch (error) {

        }
      })
    )
    .subscribe();

  mediaSyncEventSubscription = this.mediaService.roomMediaEvent$.pipe(
    switchMap((event) =>
      this.loggedInUserIsLeader
        ? of(noop())
        : of(event).pipe(
          tap((event) => this.syncPlayer(event, this.player?.getCurrentUrl()))
        )))
    .subscribe();

  roomUserConfigSubscription = this.roomUserConfig$.subscribe(ev => {
    this.loggedInUserIsLeader = ev.isLeader;
    this.showIsLeaderNotification(ev.isLeader)
  });

  isUserLeaderFeedbackSubscription = merge(
    this.chatService.userBecameLeader$.pipe(map(() => true)),
    this.chatService.userPassedOnLeader$.pipe(map(() => false))
  ).pipe(
    tap(isLeader => {
      this.loggedInUserIsLeader = isLeader;

      if (!isLeader) {
        this.showIsLeaderNotification(isLeader, true)
      }
    })
  ).subscribe()

  errorEventSubscription = this.socketService.connectionError$.pipe(
    tap(() => {
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

  onMediaNotPlayble(url: string) {
    this.mediaService.reportMediaNotPlayable({ roomName: this.name, url })
  }


  giveLeader(member: RoomUser) {
    this.chatService.giveLeader({ member, roomName: this.name });
  }

  private sendMediaUpdate(media: MediaRepresentation) {
    try {
      const isPaused = !this.player.isPlaying();
      const mediaUrl = this.player.getCurrentUrl();
      if (isPaused || !mediaUrl) {
        // Dont update when leader paused video.
        return;
      }

      const normalizedCurrentTime = media?.isLive
        ? 0
        : this.player.getCurrentTime();

      this.activeItemSubject.next(media);

      this.mediaService.sendMediaEvent({
        url: mediaUrl,
        currentTime: normalizedCurrentTime,
        roomName: this.name,

      });
    } catch (error) {
      console.log(error);
      console.log('Player may not be loaded yet', error);
    }
  }

  private timeOfLatestAttemptAtPlayerLaunch = new Date();
  private syncPlayer(media: MediaRepresentation, nowPlayingUrl: string) {
    const { currentTime, url } = media;
    let didSync = false
    try {
      const isUrlOutOfSync = nowPlayingUrl !== url;
      const isTimeOutOfSync = this.isCurrentTimeOutOfSync(currentTime);
      const isPlaying = this.player.isPlaying();
      const wasLastLaunchTwoSecondsAgo = (new Date().getTime() - this.timeOfLatestAttemptAtPlayerLaunch.getTime()) >= 2000;

      if (wasLastLaunchTwoSecondsAgo) {
        if (!isPlaying) {
          this.timeOfLatestAttemptAtPlayerLaunch = new Date();
          debugLog('!isPlaying, player.play');

          this.player.play(url);

          didSync = true;

        } else if (isUrlOutOfSync) {
          this.timeOfLatestAttemptAtPlayerLaunch = new Date();
          debugLog('isUrlOutOfSync, player.play');

          this.player.play(url)
          this.activeItemSubject.next(media);

          didSync = true;
        } else if (isTimeOutOfSync) {
          debugLog('isTimeOutOfSync, player.seek');

          this.player.seek(currentTime);

          didSync = true;
        }
      }
    } catch (error) {
      this.timeOfLatestAttemptAtPlayerLaunch = new Date();
      didSync = false;
      debugLog('Error while syncing player - probably not ready yet', error);
    }

    debugLog(`did sync? ..${didSync}`);
  }

  private isCurrentTimeOutOfSync(originTime: number) {
    try {
      const clientTime = this.player.getCurrentTime();

      if (typeof originTime !== 'number'
        || !clientTime) {
        return false;
      }
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
  private showIsLeaderNotification(isLeader: boolean, showWhenIsNotLeader = false) {
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

    if (!showWhenIsNotLeader && !isLeader) {
      return;
    }


    this.notification.success(
      isLeader
        ? msgs.forNewLeader.title
        : msgs.forExLeader.title,
      isLeader
        ? msgs.forNewLeader.body
        : msgs.forExLeader.body,
    )
  }

  ngOnDestroy(): void {
    this.mediaUpdateTimerSubscription.unsubscribe();
    this.mediaSyncEventSubscription.unsubscribe();
    this.errorEventSubscription.unsubscribe();
    this.roomUserConfigSubscription.unsubscribe();
    this.isUserLeaderFeedbackSubscription.unsubscribe();
    this.chatService.exit(this.name);
  }
}
