import { Component, ViewChild } from '@angular/core';
import { MediaComponent, SupportedPlayers } from '../media/media.component';

@Component({
  selector: 'app-player-debug',
  templateUrl: './player-debug.component.html',
  styleUrls: ['./player-debug.component.scss']
})
export class PlayerDebugComponent {

  constructor() { }
  @ViewChild(MediaComponent) player: MediaComponent;

  videoUrl = 'https://cdn.lbryplayer.xyz/api/v3/streams/free/Pandemic-Explained-David-Icke/5c9719a0dfb7b8d72bb9b8558ec07e7afcae3ea7/be58c0';

  playerActions = [
    { label: SupportedPlayers.HTML5, action: () => this.showHtml5Player() },
    { label: SupportedPlayers.TWITCH, action: () => this.showTwitchPlayer() },
    { label: SupportedPlayers.VIMEO, action: () => this.showVimeoPlayer() },
    { label: SupportedPlayers.YT, action: () => this.showYoutubePlayer() },
    { label: 'Iframe', action: () => this.showPlyrIframePlayer() },
    { label: 'Clear', action: () => this.clear() }
  ];

  play() {
    this.player.play(this.videoUrl);
  }

  private showTwitchPlayer() {
    this.player.play("https://www.twitch.tv/sds_drones");
  }

  private showYoutubePlayer() {
    this.player.play("https://www.youtube.com/watch?v=wWS1LrzWeiY");
  }

  private showHtml5Player() {
    this.player.play("https://cdn.lbryplayer.xyz/api/v3/streams/free/Pandemic-Explained-David-Icke/5c9719a0dfb7b8d72bb9b8558ec07e7afcae3ea7/be58c0");
  }

  private showVimeoPlayer() {
    this.player.play("https://vimeo.com/737031772");
  }

  private showPlyrIframePlayer() {
    this.player.play(`<iframe
    src="https://player.vimeo.com/video/309741585"
    allowfullscreen
    allowtransparency
    allow="autoplay"></iframe>`);
  }

  private clear() {
    this.player.ref.destroy();
  }

  onEnded() {

  }

}
