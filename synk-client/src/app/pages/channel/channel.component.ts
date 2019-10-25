import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MediaComponent } from './media/media.component';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss']
})
export class ChannelComponent implements OnInit {

  @ViewChild('player', { static: true }) player: MediaComponent;

  name: string;
  mediaUrl = 'https://www.youtube.com/watch?v=_Jw7_DLlU4s';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.name = this.route.snapshot.paramMap.get('name');
  }

}
