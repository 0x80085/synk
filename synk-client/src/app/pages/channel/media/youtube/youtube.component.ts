import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd';

import { BaseMediaComponent } from '../base-media.component';
import { errorDictionary } from './player-errors.model';

@Component({
  selector: 'app-youtube',
  templateUrl: './youtube.component.html',
  styleUrls: ['./youtube.component.scss']
})
export class YoutubeComponent implements BaseMediaComponent, OnInit {
  @Output() videoEnded = new EventEmitter();

  isReady = false;
  player: YT.Player;

  isPlaying = () =>
    this.player && this.player.getPlayerState() === YT.PlayerState.PLAYING

  constructor(private notification: NzNotificationService) {}

  ngOnInit() {
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'http://www.youtube.com/iframe_api';

      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        this.createPlayer();
      };
    } else {
      this.createPlayer();
    }
  }

  start(url?: string): void {
    if (url) {
      this.player.loadVideoById(YouTubeGetID(url), 0, 'large');
      return;
    }
    this.player.playVideo();
  }

  play(url: string): void {

    if (!this.isReady) {
      // then we wait till player isReady
      const isContinue = false;
      setTimeout(async () => {
        while (!isContinue) {
          await sleep(1000);
        }
        this.player.loadVideoById(YouTubeGetID(url), 0);
      }, 5);
      return;
    }

    if (url) {
      this.player.loadVideoById(YouTubeGetID(url), 0);
    }
  }

  pause(): void {
    this.player.pauseVideo();
  }

  seek(to: number): void {
    console.log('seeking');

    this.player.seekTo(to, true);
  }

  getCurrentTime(): number {
    return this.player.getCurrentTime();
  }

  getCurrentUrl(): string {
    return this.player.getVideoUrl();
  }

  onPlayerReady = event => {
    this.player = event.target;
    this.isReady = true;
  }

  onPlayerStateChange = event => {
    console.log(event);
    if (event.data === 0) {
      this.videoEnded.emit();
    }
  }

  onPlayerError = event => {
    console.log(event);
    this.showPlayerErrorToast(event);
  }

  stopVideo() {
    this.player.stopVideo();
  }

  private createPlayer() {
    this.player = new YT.Player('player', {
      height: '100%',
      width: '100%',
      videoId: '',
      events: {
        onReady: ev => this.onPlayerReady(ev),
        onError: ev => this.onPlayerError(ev),
        onStateChange: ev => this.onPlayerStateChange(ev)
      }
    });
  }

  private showPlayerErrorToast(event: any) {
    this.notification.create(
      errorDictionary[event.data].type,
      errorDictionary[event.data].title,
      errorDictionary[event.data].body
    );
  }
}

export function YouTubeGetID(url) {
  let ID = '';
  url = url
    .replace(/(>|<)/gi, '')
    .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  if (url[2] !== undefined) {
    ID = url[2].split(/[^0-9a-z_\-]/i);
    ID = ID[0];
  } else {
    ID = url;
  }
  return ID;
}

function sleep(timer) {
  return new Promise(resolve => {
    timer = timer || 2000;
    setTimeout(() => {
      resolve();
    }, timer);
  });
}
