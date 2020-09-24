import { Component, OnInit, ViewChild } from '@angular/core';
import { MediaComponent } from '../media/media.component';

@Component({
  selector: 'app-player-debug',
  templateUrl: './player-debug.component.html',
  styleUrls: ['./player-debug.component.scss']
})
export class PlayerDebugComponent implements OnInit {

  constructor() { }
  @ViewChild(MediaComponent) player: MediaComponent;

  videoUrl = 'https://cdn.lbryplayer.xyz/api/v3/streams/free/Pandemic-Explained-David-Icke/5c9719a0dfb7b8d72bb9b8558ec07e7afcae3ea7/be58c0';

  ngOnInit(): void {
  }

  play() {
    this.player.play(this.videoUrl);
  }

  showYoutubePlayer(){
    this.player.play("https://www.youtube.com/watch?v=wWS1LrzWeiY&t=95s");
  }

  showHtml5Player(){
    this.player.play("https://cdn.lbryplayer.xyz/api/v3/streams/free/Pandemic-Explained-David-Icke/5c9719a0dfb7b8d72bb9b8558ec07e7afcae3ea7/be58c0");
  }

  clear(){
    this.player.ref.destroy();
  }

  onEnded() {

  }

}
