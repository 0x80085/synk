import { Component, OnInit, EventEmitter, ViewChild, ElementRef, Output, AfterViewInit } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable, merge } from 'rxjs';

import { BaseMediaComponent } from '../base-media.component';
import { mapTo, tap } from 'rxjs/operators';

@Component({
  selector: 'app-html5-video',
  templateUrl: './html5.component.html',
  styleUrls: ['./html5.component.scss']
})
export class Html5Component implements BaseMediaComponent, AfterViewInit {

  @Output()
  videoEnded: EventEmitter<unknown>;

  @ViewChild('videoElement')
  videoElement: ElementRef<HTMLVideoElement>;

  videoSubject = new BehaviorSubject('https://cdn.lbryplayer.xyz/api/v2/streams/free/lofi-remixes-vol-1-lofi-hiphop-mix/554a4bfa78919aa9bd6b80ec50d0e2027cc5bad7');

  player: HTMLVideoElement;

  ended$: Observable<boolean>;
  error$: Observable<boolean>;

  constructor() { }

  isPlaying = () => !this.player.paused;

  play = (url?: string) => {
    this.player.src = url;
    this.player.play();
  }

  pause = () => this.player.pause();

  seek = (to: number) => this.player.currentTime = to;

  getCurrentTime = () => this.player.currentTime;

  getCurrentUrl = () => this.player.src;


  ngAfterViewInit() {

    this.player = this.videoElement.nativeElement;

    this.ended$ = merge(
      fromEvent(this.videoElement.nativeElement, 'ended'),
      fromEvent(this.videoElement.nativeElement, 'error')
    ).pipe(mapTo(true));

    this.error$ = fromEvent(this.videoElement.nativeElement, 'error')
      .pipe(
        tap(e => console.log(e)),
        mapTo(true)
      );
  }


}
