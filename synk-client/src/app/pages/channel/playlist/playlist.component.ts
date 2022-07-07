import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BehaviorSubject, combineLatest, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, map, startWith, tap } from 'rxjs/operators';
import { debugLog, doLog } from 'src/app/utils/custom.operators';
import { AuthService } from '../../account/auth.service';
import { MediaService } from '../media.service';


interface PlaylistItem {
  active: boolean;
  title: string;
  mediaUrl: string;
  length: string;
  addedBy?: { memberId: string, username: string };
}

const SUPPORTED_MEDIA_HOSTS = [
  'youtu.be',
  'youtube.com',
  'www.youtu.be',
  'www.youtube.com',
  'twitch.tv',
  'www.twitch.tv',
  //'soundcloud.com',
  //'vimeo.com',
  //'archive.org',
  // 'dailymotion.com',
  // 'twitter.com',
  // 'reddit.com',
  // 'vk.ru',
]

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnDestroy, OnInit {

  @Input() roomName: string;

  @Input() isAutomatedRoom: boolean;

  @Input() isLeader: boolean;

  @Input() isOwner: boolean;

  @Input() isSuperAdmin: boolean;

  @Output() playMedia = new EventEmitter<string>();

  addMediaform: FormGroup;
  updateSkipRatioForm: FormGroup;

  voteSkips = new BehaviorSubject(0);
  maxVoteSkips = new BehaviorSubject(0);
  votedForSkip = false;

  localPlaylist: PlaylistItem[] = [];

  supportedMediaHosts = SUPPORTED_MEDIA_HOSTS;

  nowPlayingSubject: Subject<PlaylistItem> = new Subject()

  nowPlayingUrlChangedEvent$ = this.mediaService.roomMediaEvent$.pipe(
    doLog('nowPlayingChangeEvent$', true),
    distinctUntilChanged((current, next) => current.url === next.url),
    tap(_ => this.votedForSkip = false)
  );

  loggedInUserId$ = this.auth.getUser().pipe(
    map(({ id }) => id)
  )

  private playlistUpdateEvent$ = combineLatest([
    this.mediaService.roomPlaylistUpdateEvents$,
    this.nowPlayingUrlChangedEvent$.pipe(startWith(null))
  ]).pipe(
    doLog(' playlistUpdateEvent$', true),
    map(([{ entries }, nowPlaying]) =>
      entries.map(entry => ({
        ...entry,
        mediaUrl: entry.url,
        active: entry.url === nowPlaying?.url,
        length: new Date(entry.duration * 1000).toISOString().substr(11, 8)
      }))),
    doLog('playlist update', true),
    tap(ls => {
      const nowPlaying = ls.find(it => it.active === true)
      if (nowPlaying) {
        this.nowPlayingSubject.next(nowPlaying)
      }
    }),
  );

  private playlistUpdateSubscription: Subscription = this.playlistUpdateEvent$
    .pipe(
      tap(ls => this.localPlaylist = ls),
      doLog('playlistUpdateSubscription', true),
    ).subscribe();

  private addMediaErrorFeedbackSubscription = this.mediaService.addMediaErrEvent$.pipe(
    tap(_ => this.notification.error('Error', `Couldnt add media to playlist...`))
  ).subscribe();

  private addMediaSuccesFeedbackSubscription = this.mediaService.addMediaSuccessEvent$.pipe(
    tap(({ playlistCount, url }) => this.startPlaybackIfFirstItemInList(playlistCount, url)),
    tap(_ => this.notification.success('Media added!', `Request to add media to playlist succeeded!`, { nzDuration: 5000 }))
  ).subscribe();

  private removeMediaErrorFeedbackSubscription = this.mediaService.removeMediaErrEvent$.pipe(
    tap(_ => this.notification.error('Failed to remove media from playlist', `Only users who have added the entry can remove it`))
  ).subscribe();

  private voteSkipCountUpdateSubscription = this.mediaService.onVoteSkipCountEvent$.pipe(
    doLog("voteSkipCountUpdateSubscription", true),
    tap(({ count }) => this.voteSkips.next(count)),
    tap(({ max }) => this.maxVoteSkips.next(max)),
    tap(({ count, max }) => {
      if (count >= max) {
        console.log('maxvoteskips reached, trying to play next');

        this.skipToNextAsLeader();
      }
    })
  ).subscribe();

  private removeMediaSuccesFeedbackSubscription = this.mediaService.removeMediaSuccessEvent$.pipe(
    tap(_ => this.notification.success('Success', 'Media removed from playlist'))
  ).subscribe();

  private clearPlaylistSuccesFeedbackSubscription = this.mediaService.clearPlaylistSuccessEvent$.pipe(
    tap(_ => this.notification.success('Success', 'Playlist cleared!'))
  ).subscribe();

  constructor(
    private fb: FormBuilder,
    private mediaService: MediaService,
    private notification: NzNotificationService,
    private auth: AuthService) { }

  private skipToNextAsLeader() {

    if (this.isLeader) {

      const hasNextUp = this.localPlaylist.length > 1;

      if (hasNextUp) {
        const activeItemIndex = this.localPlaylist.findIndex(it => it.active);
        const playlistLastPosition = this.localPlaylist.length - 1;
        const startFromTop = activeItemIndex === playlistLastPosition;
        const nextUpIndex = startFromTop
          ? 0
          : activeItemIndex + 1;

        console.log("skipping to " + this.localPlaylist[nextUpIndex].mediaUrl);
        this.playMedia.emit(this.localPlaylist[nextUpIndex].mediaUrl);
      }
    }
  }

  ngOnInit() {
    this.addMediaform = this.fb.group({
      mediaUrl: [
        null,
        [
          Validators.required,
          PlaylistComponent.validateIsUrl()
        ]
      ]
    });
  }

  onAddMedia() {
    if (this.addMediaform.invalid) {
      return;
    }

    this.mediaService.addToPlaylist({
      url: this.addMediaform.controls.mediaUrl.value,
      roomName: this.roomName,
      currentTime: null
    });
    this.addMediaform.controls.mediaUrl.patchValue('');
    this.addMediaform.controls.mediaUrl.reset();
    this.notification.info('Request Submitted', 'The request to add media to the current list is in progress. You will be updated if the request was (un)succesful');
  }

  onRemoveMedia(mediaUrl: string) {
    if (confirm(`Want to delete ${mediaUrl}?`)) {
      this.mediaService.removeFromPlaylist({
        url: mediaUrl,
        roomName: this.roomName,
        currentTime: null
      });
    }
  }

  onVoteSkip() {
    if (!this.votedForSkip) {
      this.mediaService.voteSkip(this.roomName);
      this.votedForSkip = true;
    }
  }

  onClearPlaylist() {
    if (this.isSuperAdmin || this.isOwner) {

      if(confirm("Really clear the playlist?")){
        this.mediaService.clearPlaylist(this.roomName);
      }
    }
  }

  onUpdateVoteSkipRatio() {
    if (this.updateSkipRatioForm.invalid) {
      return;
    }
    const ratio = this.updateSkipRatioForm.controls.ratio.value;

    this.updateSkipRatioForm.controls.ratio.patchValue('');
    this.updateSkipRatioForm.controls.ratio.reset();

    console.log(ratio);
    this.mediaService.updateVoteSkipRatio(this.roomName, ratio);

  }

  drop(event: CdkDragDrop<string[]>): void {
    const { currentIndex, previousIndex } = event
    if (currentIndex === previousIndex) {
      return
    }

    const movedMediaValue = this.localPlaylist[previousIndex];

    this.mediaService.changePositionInPlaylist({ roomName: this.roomName, mediaUrl: movedMediaValue.mediaUrl, newPosition: event.currentIndex })
  }

  onShuffle() {
    this.mediaService.shufflePlaylist(this.roomName);
  }

  private startPlaybackIfFirstItemInList(playlistCount: number, url: string) {
    if (playlistCount === 1 && this.isLeader) {
      setTimeout(() => {
        debugLog('startPlaybackIfFirstItemInList .. ' + url, this.localPlaylist)
        this.playMedia.emit(this.localPlaylist[0].mediaUrl)
      }, 500)
    }
  }

  ngOnDestroy(): void {
    this.playlistUpdateSubscription.unsubscribe();

    this.addMediaErrorFeedbackSubscription.unsubscribe();
    this.addMediaSuccesFeedbackSubscription.unsubscribe();

    this.removeMediaSuccesFeedbackSubscription.unsubscribe();
    this.clearPlaylistSuccesFeedbackSubscription.unsubscribe();
    this.removeMediaErrorFeedbackSubscription.unsubscribe();

    this.voteSkipCountUpdateSubscription.unsubscribe();
  }

  static validateIsUrl(): ValidatorFn {
    return ({ value }: AbstractControl): ValidationErrors | null => {

      return PlaylistComponent.isValidMediaUrl(value)
    }
  }

  static isValidMediaUrl(value: string) {
    let validUrl = true;

    try {
      const { host } = new URL(value)

      if (SUPPORTED_MEDIA_HOSTS.indexOf(host) === -1) {
        throw new Error();
      }

      // if (!YouTubeGetID(value)) {
      //   throw new Error();
      // }
    } catch {
      validUrl = false;
    }

    return validUrl ? null : { invalidUrl: { value: value } };
  }
}
