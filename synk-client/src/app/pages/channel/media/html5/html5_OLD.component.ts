import { Component, OnInit, EventEmitter, ViewChild, ElementRef, Output, AfterViewInit } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable, merge, Subject, Subscription, combineLatest } from 'rxjs';

import { BaseMediaComponent } from '../base-media.component';
import { mapTo, tap, withLatestFrom, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-html5-video',
  templateUrl: './html5.component.html',
  styleUrls: ['./html5.component.scss']
})
export class Html5Component implements BaseMediaComponent, AfterViewInit {

  @Output()
  videoEnded = new EventEmitter();

  @ViewChild('videoElement')
  videoElement: ElementRef<HTMLVideoElement>;

  player: HTMLVideoElement;

  ended$: Observable<boolean>;
  error$: Observable<boolean>;

  canPlayEvent$: Observable<boolean>;

  currentMediaUrl = new Subject<string>();
  mediaFeedSubscription: Subscription;

  constructor() { }

  isPlaying = () => !this.player.paused;

  play = (url: string) => {
    this.currentMediaUrl.next(url);
  }

  pause = () => this.player.pause();

  seek = (to: number) => this.player.currentTime = to;

  getCurrentTime = () => this.player.currentTime;

  getCurrentUrl = () => this.player.src;


  ngAfterViewInit() {

    this.player = this.getPlayer();

    this.canPlayEvent$ = fromEvent(this.player, 'canplay')
      .pipe(
        startWith(false),
        mapTo(true)
      );

    this.mediaFeedSubscription =
      this.canPlayEvent$.pipe(
        withLatestFrom(this.currentMediaUrl),
        tap(([canPlay, url]) => {
          if (this.player && this.player.src !== url && canPlay) {
            this.changeSrc(url);
          }
          if (!this.isPlaying()) {
            this.player.play()
          }
        }),
      ).subscribe()

    this.ended$ = merge(
      fromEvent(this.getPlayer(), 'ended'),
      fromEvent(this.getPlayer(), 'error')
    ).pipe(mapTo(true));

    this.error$ = fromEvent(this.getPlayer(), 'error')
      .pipe(
        tap(e => console.log(e)),
        mapTo(true)
      );
  }

  private getPlayer() {
    return this.videoElement.nativeElement;
  }

  private changeSrc(url: string) {
    if (!this.player) {
      this.player = this.getPlayer();
    }
    this.player.src = url;
    this.player.load();
  }
}

