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

  initPlayer(player: Plyr) {
    console.log('initplayer');
    console.log(player.source);

  }

  onCanPlay() {
    console.log('onCanPlay');

    console.log(this.videoSources)

    // this.plyr.player.play();
  }
  onReady() {
    console.log('onReady');
    
    this.plyr.player.play();
  }
  onLoadedData() {
    console.log('onLoadedData');

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

  getCurrentTime(): number {
    return this.plyr.player.currentTime;
  }

  getCurrentUrl(): string {
    return this.src;
  }

  setCurrentUrl(url: string): void {
    // if (!url) {
    //   return;
    // }
    // if (url !== this.src) {
    //   this.src = url;
    //   if (this.plyr) {
    //     this.setPlyrSource(url);
    //   }
    // }
  }

  private setPlyrSource(url: string) {

    // if (isVimeoUrl(url)) {
    //   this.plyr.player.source = null;
    //   this.plyr.player.source = {
    //     type: 'video',
    //     sources: [
    //       {
    //         src: url,
    //         provider: 'vimeo',
    //       },
    //     ],
    //   };

    // } else {
    //   this.plyr.player.source = null;
    //   this.plyr.player.source = { sources: [{ src: url }], type: 'video' };
    // }

    // console.log('plyr source ', this.plyr.player.source);

  }

  getDuration(): number {
    return this.plyr.player.duration;
  }


}
