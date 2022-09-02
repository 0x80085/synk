import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { BaseMediaComponent } from '../base-media.component';

import { PlyrComponent as PlyrComp } from "ngx-plyr";
import * as Plyr from 'plyr';

export function isVimeoUrl(url: string) {
  const regx = /^(?:https?:\/\/)?(?:www\.|go\.)?vimeo\.com\/([a-z0-9_]+)($|\?)/
  return regx.test(url);
}

@Component({
  selector: 'app-plyr',
  templateUrl: './plyr.component.html',
  styleUrls: ['./plyr.component.scss']
})
export class PlyrComponent implements BaseMediaComponent {

  @ViewChild(PlyrComp)
  plyr: PlyrComp;

  src: string;
  videoSources: Plyr.Source[] = [];

  @Output()
  mediaEnded: EventEmitter<unknown> = new EventEmitter();

  @Output()
  mediaNotPlayable: EventEmitter<unknown> = new EventEmitter();

  private currentTime = 0;

  constructor() { }

  play(url?: string): void {

    console.log('play');

    let source: Plyr.Source = null;

    if (isVimeoUrl(url)) {
      source = {
        src: url,
        provider: 'vimeo',
      };
    } else {
      source = { src: url, type: 'video/mp4', };
    }

    this.videoSources = new Array(source);
  }

  initPlayer(_: Plyr) {
  }

  onCanPlay() {
  }

  onReady() {
    this.plyr.player.play();
  }

  onLoadedData() {

  }

  onError(error: any) {
    console.log(error);
  }

  isPlaying(): boolean {
    return this.plyr && this.plyr.player.playing;
  }

  pause(): void {
    this.plyr.player.pause();
  }

  seek(to: number): void {
    this.plyr.player.currentTime = to;
  }

  onTimeUpdate(event: Plyr.PlyrEvent) {
    this.currentTime = event.detail.plyr.currentTime;
  }

  getCurrentTime(): number {
    return this.currentTime;
  }

  getCurrentUrl(): string {
    return this.src;
  }

  setCurrentUrl(url: string): void {
    this.src = url
  }

  getDuration(): number {
    return this.plyr.player.duration;
  }

}
