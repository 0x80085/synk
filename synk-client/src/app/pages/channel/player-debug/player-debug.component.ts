import { Component, OnInit, ViewChild } from '@angular/core';
import { Html5Component } from '../media/html5/html5.v2.component';

@Component({
  selector: 'app-player-debug',
  templateUrl: './player-debug.component.html',
  styleUrls: ['./player-debug.component.scss']
})
export class PlayerDebugComponent implements OnInit {

  constructor() { }
  @ViewChild(Html5Component) child: Html5Component;

  videoUrl = 'https://cdn.lbryplayer.xyz/api/v3/streams/free/Pandemic-Explained-David-Icke/5c9719a0dfb7b8d72bb9b8558ec07e7afcae3ea7/be58c0';

  ngOnInit(): void {
  }

  play() {
    this.child.play(this.videoUrl);
  }

  onEnded() {

  }

}
