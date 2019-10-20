import { Component, OnInit, Input } from '@angular/core';
import { BaseMediaComponent } from '../base-media.component';

@Component({
  selector: 'app-youtube',
  templateUrl: './youtube.component.html',
  styleUrls: ['./youtube.component.scss']
})
export class YoutubeComponent implements BaseMediaComponent, OnInit {

  @Input() url: string;

  player: YT.Player;

  constructor() { }

  ngOnInit() {

    if (!(window as any).YT) {
      // 2. This code loads the IFrame Player API code asynchronously.
      const tag = document.createElement('script');
      tag.src = 'http://www.youtube.com/iframe_api';

      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // 3. This function creates an <iframe> (and YouTube player)
      //    after the API code downloads.
      (window as any).onYouTubeIframeAPIReady = (() => {
        this.createPlayer()
      });
    } else {

      this.createPlayer()

    }

  }

  start?(url: string) {
    // this.player.cueVideoById(url);
    // this.player.playVideo();
  }

  play(): void {
    // this.player.playVideo();
  }

  pause(): void {
    this.player.pauseVideo();
  }

  seek(to: number): void {
    this.player.seekTo(to, true);
  }

  // 4. The API will call this function when the video player is ready.
  onPlayerReady(event) {
    this.player = event.target;
    // this.player.cueVideoByUrl(this.url)

    // this.start(this.url) 
  }

  // 5. The API calls this function when the player's state changes.
  //    The function indicates that when playing a video (state=1),
  //    the player should play for six seconds and then stop.
  onPlayerStateChange(event) {
    console.log(event);

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
        onReady: (ev) => this.onPlayerReady(ev),
        onError: (ev) => console.log(ev),
        onStateChange: (ev) => this.onPlayerStateChange(ev)
      }
    });
  }

}

function YouTubeGetID(url) {
  var ID = '';
  url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  if (url[2] !== undefined) {
    ID = url[2].split(/[^0-9a-z_\-]/i);
    ID = ID[0];
  }
  else {
    ID = url;
  }
  return ID;
}