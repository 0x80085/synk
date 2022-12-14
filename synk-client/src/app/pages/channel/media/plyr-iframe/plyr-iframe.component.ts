import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { BaseMediaComponent } from '../base-media.component';

import { PlyrComponent as PlyrComp } from 'ngx-plyr';
import * as Plyr from 'plyr';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

import { Pipe, PipeTransform} from "@angular/core";

@Pipe({ name: 'safeUrl' })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }
  transform(url) {
    console.log(url);

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Pipe({ name: 'safeHtml' })
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }
  transform(url) {
    console.log(url);
    // return this.sanitizer.sanitize(SecurityContext.HTML, url);
    return this.sanitizer.bypassSecurityTrustHtml(url);
  }
}

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
  iframeSrc$ = this.iframeHtmlSubject.pipe(

    distinctUntilChanged(),
    map((iframe) => {
      console.log('parsing iframe');

      const parsed: HTMLIFrameElement = new DOMParser()
        .parseFromString(iframe, 'text/html')
        .getElementsByTagName('iframe')[0];
      console.log(parsed.src);
      this.src = parsed.src
        return parsed.src
      // return `<iframe src="${parsed.src}" allowfullscreen allowtransparency allow="autoplay"></iframe>`
    }),

    // map((iframe) => this.sanitizer.bypassSecurityTrustUrl(iframe)),
      // map(url =>{
      //   return `<iframe src="${ this.sanitizer.bypassSecurityTrustUrl(url)}" allowfullscreen allowtransparency allow="autoplay"></iframe>`

      // })
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
    try {
      return this.src
      return this.plyr && this.plyr?.player?.source?.sources[0]?.src;
    } catch(e) {
      console.log(e);
      return null
    }
  }

  setCurrentUrl(content: string): void {
    this.iframeHtmlSubject.next(content);
  }

  getDuration(): number {
    return this.plyr.player.duration;
  }
}
