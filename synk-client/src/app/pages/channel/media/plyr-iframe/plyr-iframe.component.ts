import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { BaseMediaComponent } from '../base-media.component';

import { PlyrComponent as PlyrComp } from 'ngx-plyr';
import * as Plyr from 'plyr';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-plyr-iframe',
  templateUrl: './plyr-iframe.component.html',
  styleUrls: ['./plyr-iframe.component.scss'],
})
export class PlyrIframeComponent implements BaseMediaComponent {
  @ViewChild(PlyrComp)
  plyr: PlyrComp;

  src: string;
  videoSources: Plyr.Source[] = [];

  @Output()
  mediaEnded: EventEmitter<unknown> = new EventEmitter();

  @Output()
  mediaNotPlayable: EventEmitter<unknown> = new EventEmitter();

  private iframeHtmlSubject = new BehaviorSubject(``);
  iframeHtml$ = this.iframeHtmlSubject.pipe(
    distinctUntilChanged(),
    map((iframe) => {
      const parsed: HTMLIFrameElement = new DOMParser()
        .parseFromString(iframe, 'text/html')
        .getElementsByTagName('iframe')[0];

      return `<iframe src="${parsed.src}" allowfullscreen allowtransparency allow="autoplay"></iframe>`
    }),

    map((iframe) => this.sanitizer.bypassSecurityTrustHtml(iframe))
  );

  private currentTime = 0;

  constructor(private sanitizer: DomSanitizer) {}

  play(content?: string): void {
    this.iframeHtmlSubject.next(content);
  }

  initPlayer(_: Plyr) {}

  onCanPlay() {}

  onReady() {
    this.plyr.player.play();
  }

  onLoadedData() {}

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
    return (this.plyr && this.plyr.player?.source?.sources[0]?.src) || null;
  }

  setCurrentUrl(content: string): void {
    this.iframeHtmlSubject.next(content);
  }

  getDuration(): number {
    return this.plyr.player.duration;
  }
}
