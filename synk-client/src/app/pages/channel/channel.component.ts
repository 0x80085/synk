import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MediaComponent } from './media/media.component';
import { ChatService } from './chat.service';
import { timer, Subscription } from 'rxjs';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss']
})
export class ChannelComponent implements OnInit, OnDestroy {
  @ViewChild('player', { static: true }) player: MediaComponent;

  name: string;
  mediaUrl = 'https://www.youtube.com/watch?v=_Jw7_DLlU4s';
  isLeader?: boolean = true;

  mediaUpdateTimer: Subscription;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.name = this.route.snapshot.paramMap.get('name');
    this.sendPeriodicUpdate();
  }

  sendPeriodicUpdate() {
    const source = timer(1000, 2000);
    this.mediaUpdateTimer = source.subscribe(val => {
      if (this.isLeader) {
        console.log('sending update');
        this.sendMediaUpdate();
      }
    });
  }

  private sendMediaUpdate() {
    try {
      this.chatService.sendMediaEvent(
        this.mediaUrl,
        this.player.getCurrentTime(),
        this.name
      );
    } catch (error) {
      console.log(error);
    }
  }

  ngOnDestroy(): void {
    this.mediaUpdateTimer.unsubscribe();
  }
}
