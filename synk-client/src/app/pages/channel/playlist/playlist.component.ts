import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { combineLatest, Subject, Subscription } from 'rxjs';
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

  @Output() playMedia = new EventEmitter<string>();

  form: FormGroup;

  showControls: boolean;

  localPlaylist: PlaylistItem[] = [];

  supportedMediaHosts = SUPPORTED_MEDIA_HOSTS;

  nowPlayingLabelSubject: Subject<PlaylistItem> = new Subject()

  nowPlayingChangeEvent$ = this.mediaService.roomMediaEvent$.pipe(
    doLog('nowPlayingChangeEvent$', true),
    distinctUntilChanged((one, two) => one.mediaUrl === two.mediaUrl),
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
    tap(ls => ls.find(it => it.active == true)
      ? this.nowPlayingLabelSubject.next(ls.find(it => it.active == true))
      : null)
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

  private removeMediaSuccesFeedbackSubscription = this.mediaService.removeMediaSuccessEvent$.pipe(
    tap(_ => this.notification.success('Success', 'Media removed from playlist'))
  ).subscribe();

  constructor(
    private fb: FormBuilder,
    private mediaService: MediaService,
    private notification: NzNotificationService) { }

  ngOnInit() {
    this.form = this.fb.group({
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
    if (this.form.invalid) {
      return;
    }

    this.mediaService.addToPlaylist({
      mediaUrl: this.form.controls.mediaUrl.value,
      roomName: this.roomName,
      currentTime: null
    });
    this.form.controls.mediaUrl.patchValue('');
    this.form.controls.mediaUrl.reset();
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

  drop(event: CdkDragDrop<string[]>): void {
    const { currentIndex, previousIndex } = event
    if (currentIndex === previousIndex) {
      return
    }

    const movedMediaValue = this.localPlaylist[previousIndex];

    this.mediaService.changePositionInPlaylist({ roomName: this.roomName, mediaUrl: movedMediaValue.mediaUrl, newPosition: event.currentIndex })
  }

  onNext() {
    this.mediaService.playNext(this.roomName);
  }

  onShuffle() {
    this.mediaService.shufflePlaylist(this.roomName);
  }

  private startPlaybackIfFirstItemInList(playlistCount: number, url: string) {
    if (playlistCount === 1) {
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
