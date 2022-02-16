import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BehaviorSubject, combineLatest, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, map, startWith, tap, withLatestFrom } from 'rxjs/operators';
import { debugLog, doLog } from 'src/app/utils/custom.operators';
import { MediaService } from '../media.service';


interface PlaylistItem {
  active: boolean;
  title: string;
  mediaUrl: string;
  length: string;
}

const SUPPORTED_MEDIA_HOSTS = [
  'youtu.be',
  'youtube.com',
  //'soundcloud.com',
  'twitch.tv',
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

  @Input() showPlaylistItemActions: boolean;

  @Input() isLeader: boolean;

  @Output() playMedia = new EventEmitter<string>();

  addMediaform: FormGroup;
  updateSkipRatioForm: FormGroup;

  voteSkips = new BehaviorSubject(0);
  maxVoteSkips = new BehaviorSubject(0);
  votedForSkip = false;

  localPlaylist: PlaylistItem[] = [];

  supportedMediaHosts = SUPPORTED_MEDIA_HOSTS;

  nowPlayingSubject: Subject<PlaylistItem> = new Subject()

  nowPlayingChangeEvent$ = this.mediaService.roomMediaEvent$.pipe(
    doLog('nowPlayingChangeEvent$', true),
    distinctUntilChanged((current, next) => current.mediaUrl === next.mediaUrl),
  );

  private playlistUpdateEvent$ = combineLatest([
    this.mediaService.roomPlaylistUpdateEvents$,
    this.nowPlayingChangeEvent$.pipe(startWith(null))
  ]).pipe(
    doLog(' playlistUpdateEvent$', true),
    map(([{ entries }, nowPlaying]) =>
      entries.map(entry => ({
        ...entry,
        mediaUrl: entry.url,
        active: entry.url === nowPlaying?.mediaUrl,
        length: new Date(entry.length * 1000).toISOString().substr(11, 8)
      }))),
    tap(ls => {
      const nowPlaying = ls.find(it => it.active === true)
      if (!!nowPlaying) {
        this.nowPlayingSubject.next(nowPlaying)
      }
    }),
    tap(_ => this.votedForSkip = false)
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

  constructor(
    private fb: FormBuilder,
    private mediaService: MediaService,
    private notification: NzNotificationService) { }

  private skipToNextAsLeader() {
    console.log('is leader ' + this.isLeader);
    
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
      mediaUrl: this.addMediaform.controls.mediaUrl.value,
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
        mediaUrl,
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

      // if (SUPPORTED_MEDIA_HOSTS.indexOf(host) === -1) {
      //   throw new Error();
      // }

      // if (!YouTubeGetID(value)) {
      //   throw new Error();
      // }
    } catch {
      validUrl = false;
    }

    return validUrl ? null : { invalidUrl: { value: value } };
  }
}
