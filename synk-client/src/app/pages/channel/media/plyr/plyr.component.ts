import { Component, ViewChild, EventEmitter, Output } from '@angular/core';
import { BaseMediaComponent } from '../base-media.component';

import { PlyrComponent as PlyrComp } from "ngx-plyr";

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
  mediaNotPlayable: EventEmitter<unknown>  = new EventEmitter();

  constructor() { }

  play(url?: string): void {
    this.setCurrentUrl(url);
    if (this.plyr && !this.isPlaying()) {
      this.plyr.player.play();
    }
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

  getCurrentTime(): number {
    return this.plyr.player.currentTime;
  }

  getCurrentUrl(): string {
    return this.src;
  }

  setCurrentUrl(url: string): void {
    if (!url) {
      return;
    }
    if (url !== this.src) {
      this.src = url;
    }
    if (this.plyr && !this.plyr.player.playing) {
      this.plyr.player.source = { sources: [{ src: this.src }], type: 'video' };
    }
  }

  initPlayer(){
    this.play(this.src);
  }

}
