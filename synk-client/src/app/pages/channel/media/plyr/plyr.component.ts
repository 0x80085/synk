import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { BaseMediaComponent } from '../base-media.component';

import { PlyrComponent as PlyrComp } from "ngx-plyr";
import { debugLog } from 'src/app/utils/custom.operators';


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

  constructor() { }

  onPlayingHandler() {
    // const hasPlayer = Boolean(this.plyr);
    // const plyrSources = this.plyr?.player?.source?.sources || [];
    // const isCurrentDifferentFromRequested = !hasPlayer || plyrSources.every(it => it.src !== url);

    // if (isCurrentDifferentFromRequested) {
    //   debugLog('isDifferentFromCurrent')
    //   this.setCurrentUrl(url);
    //   (this.plyr.player.play() as Promise<void>)
    //     .then(it => console.log(it)
    //     )
    //     .catch(e => console.log(e)
    //     );
    //   // } else if(this.plyr && this.plyr.player.source.sources.every(it => it.src !== url)){
    //   //   this.plyr.player.play();
    //   // } else {
    //   //   debugLog('PlyrComponent else { }')
    // } else if (this.plyr && !this.isPlaying()) {
    //   this.plyr.player.play();
    // }
  }

  play(url?: string): void {
    const hasPlayer = Boolean(this.plyr);
    const plyrSources = this.plyr?.player?.source?.sources || [];
    const isCurrentDifferentFromRequested = !hasPlayer || plyrSources.every(it => it.src !== url);

    if (hasPlayer && isCurrentDifferentFromRequested) {
      debugLog('isDifferentFromCurrent')

      this.setCurrentUrl(url);
      this.plyr?.player?.play()

    } else if (hasPlayer && !this.isPlaying()) {

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
      if (this.plyr) {
        this.setPlyrSource(url);
      }
    }
  }

  private setPlyrSource(url: string) {
    this.plyr.player.autoplay = true;

    if (isVimeoUrl(url)) {
      this.plyr.player.source = null;
      this.plyr.player.source = {
        type: 'video',
        sources: [
          {
            src: url,
            provider:'vimeo',
          },
        ],
      };

    } else {
      this.plyr.player.source = null;
      this.plyr.player.source = { sources: [{ src: url }], type: 'video' };
    }
  }

  getDuration(): number {
    return this.plyr.player.duration;
  }

  initPlayer() {
    this.play(this.src);
  }
}
