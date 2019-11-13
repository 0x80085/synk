import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MediaComponent } from './media/media.component';
import { ChatService, MediaEvent, Message } from './chat.service';
import { timer, Subscription, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss']
})
export class ChannelComponent implements OnInit, OnDestroy {
  @ViewChild('player', { static: false }) player: MediaComponent;

  name: string;
  mediaUrl = 'https://www.youtube.com/watch?v=_Jw7_DLlU4s';
  isLeader?: boolean = true;

  mediaUpdateTimer$: Subscription;
  mediaSyncEvent$: Subscription;
  errorEvent$: Observable<Message[]>;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.name = this.route.snapshot.paramMap.get('name');
    this.chatService.reconnect();
    this.syncPlayerState();
    this.sendPeriodicUpdate();
    this.quitOnError();
  }

  sendPeriodicUpdate() {
    const source = timer(1000, 2000);
    this.mediaUpdateTimer$ = source.subscribe(val => {
      if (this.isLeader && this.player) {
        console.log('sending update');
        this.sendMediaUpdate();
      }
    });
  }

  syncPlayerState() {
    this.mediaSyncEvent$ = this.chatService.roomMediaEvent$.subscribe(ev => {
      if (!this.isLeader) {
        this.syncIfNeeded(ev);
      }
    });
  }

  quitOnError() {
    this.errorEvent$ = this.chatService.permissionErrorEvent$.pipe(
      tap(x => {
        console.log(x);

        this.mediaUpdateTimer$.unsubscribe();
        this.mediaSyncEvent$.unsubscribe();
      })
    );
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
      // throw Error('');
    }
  }

  private syncIfNeeded(ev: MediaEvent) {
    try {
      if (this.shouldSyncPlayer(ev)) {
        console.log('updating player');

        this.syncPlayer(ev);
      }
    } catch (error) {
      console.log(error);
    }
  }

  private syncPlayer(ev: MediaEvent) {
    if (this.mediaUrl !== ev.mediaUrl) {
      this.mediaUrl = ev.mediaUrl;
      this.player.play();
    }
    if (this.clientCurrenttimeIsOutOfSync(ev.currentTime)) {
      this.player.seek(ev.currentTime);
    }
  }

  private shouldSyncPlayer(ev: MediaEvent) {
    return (
      this.mediaUrl !== ev.mediaUrl ||
      this.clientCurrenttimeIsOutOfSync(ev.currentTime)
    );
  }

  private clientCurrenttimeIsOutOfSync(originTime: number) {
    try {
      const clientTime = this.player.getCurrentTime();
      const maxTimeBehind = originTime - 2;
      const maxTimeAhead = originTime + 2;

      return clientTime < maxTimeAhead && clientTime > maxTimeBehind;
    } catch (error) {
      return false; // getCurrentTime failed prob
    }
  }

  ngOnDestroy(): void {
    this.mediaUpdateTimer$.unsubscribe();
    this.mediaSyncEvent$.unsubscribe();
  }
}
