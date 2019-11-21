import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { tap } from 'rxjs/operators';
import { timer, Subscription, Observable } from 'rxjs';

import { MediaComponent } from './media/media.component';
import { ChatService } from './chat.service';
import { MediaEvent, Message, RoomUserConfig } from './models/room.models';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss']
})
export class ChannelComponent implements OnInit, OnDestroy {
  @ViewChild('player', { static: false }) player: MediaComponent;

  name: string;
  mediaUrl = 'https://www.youtube.com/watch?v=T-BF_KaG7rg';
  isLeader = false;

  mediaUpdateTimer$: Subscription;
  mediaSyncEvent$: Subscription;
  errorEvent$: Observable<Message[]>;
  roomUserConfig$: Subscription;

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
    this.receiveRoomConfig();
  }

  sendPeriodicUpdate() {
    const timer$ = timer(1000, 2000);
    this.mediaUpdateTimer$ = timer$.subscribe(val => {
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

  receiveRoomConfig() {
    this.roomUserConfig$ = this.chatService.roomUserConfig$.subscribe(ev => {
      console.log(ev);

      this.isLeader = ev.isLeader;
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
      console.log(this.clientCurrenttimeIsOutOfSync(ev.currentTime));

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
      const isOutOfSync =
        clientTime < maxTimeBehind || clientTime > maxTimeAhead;

      console.log(
        `
        Client time:\t${clientTime}
        maxTimeBehind :\t${maxTimeBehind}
        maxTimeAhead :\t${maxTimeAhead}
        Leader time:\t${originTime}

        client out of sync:\t${isOutOfSync}
        client behind :\t${clientTime < maxTimeBehind}
        maxTimeAhead :\t${clientTime > maxTimeAhead}
        `
      );

      return isOutOfSync;
    } catch (error) {
      console.log(error.toString && error.toString());
      return false;
    }
  }

  ngOnDestroy(): void {
    this.mediaUpdateTimer$.unsubscribe();
    this.mediaSyncEvent$.unsubscribe();
  }
}
