import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BaseMediaComponent } from '../base-media.component';

@Component({
  selector: 'app-youtube',
  templateUrl: './youtube.component.html',
  styleUrls: ['./youtube.component.scss']
})
export class YoutubeComponent implements BaseMediaComponent, OnInit {
  @Input() url: string;

  @Output() videoEnded = new EventEmitter();

  isReady = false;

  player: YT.Player;

  constructor() {}

  ngOnInit() {
    if (!(window as any).YT) {
      console.log('Building player...');

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
      // debugger;
      this.player.loadVideoByUrl(url, 0, 'large');
    }
    this.player.playVideo();
  }

  play(url?: string): void {
    if (url) {
      this.player.loadVideoByUrl(url, 0, 'large');
    }
    this.player.playVideo();
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

  onPlayerReady(event) {
    this.player = event.target;
    this.play();
    this.isReady = true;
  }

  onPlayerStateChange(event) {
    console.log(event);
    if (event.data === 0) {
      this.videoEnded.emit();
    }
  }

  stopVideo() {
    this.player.stopVideo();
  }

  private createPlayer() {
    this.player = new YT.Player('player', {
      height: '100%',
      width: '100%',
      videoId: YouTubeGetID(this.url),
      events: {
        onReady: ev => this.onPlayerReady(ev),
        onError: ev => console.log(ev),
        onStateChange: ev => this.onPlayerStateChange(ev)
      }
    });
  }
}

function YouTubeGetID(url) {
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
