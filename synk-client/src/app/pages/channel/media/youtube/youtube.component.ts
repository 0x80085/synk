import { Component, OnInit } from '@angular/core';
import { BaseMediaComponent } from '../base-media.component';

@Component({
  selector: 'app-youtube',
  templateUrl: './youtube.component.html',
  styleUrls: ['./youtube.component.scss']
})
export class YoutubeComponent implements BaseMediaComponent, OnInit {

  player: YT.Player;

  constructor() { }

  ngOnInit() {

    // 2. This code loads the IFrame Player API code asynchronously.
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';

    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // 3. This function creates an <iframe> (and YouTube player)
    //    after the API code downloads.
    (window as any).onYouTubeIframeAPIReady = (() => {
      this.player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: 'M7lc1UVf-VE',
        events: {
          onReady: this.onPlayerReady,
          onStateChange: this.onPlayerStateChange
        }
      });
    });
  }

  async start?(url: string) {
    await this.waitForApi();

    this.player.loadVideoByUrl(url);
    this.player.playVideo();
  }

  play(): void {
    this.player.playVideo();
  }

  pause(): void {
    this.player.pauseVideo();
  }

  seek(to: number): void {
    this.player.seekTo(to, true);
  }

  async waitForApi() {
    while (!(window as any).YT) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // 4. The API will call this function when the video player is ready.
  onPlayerReady(event) {
    event.target.playVideo();
  }

  // 5. The API calls this function when the player's state changes.
  //    The function indicates that when playing a video (state=1),
  //    the player should play for six seconds and then stop.
  onPlayerStateChange(event) {

  }

  stopVideo() {
    this.player.stopVideo();
  }

}
