import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd';
import { Observable } from 'rxjs';

import { AuthService, Channel } from '../../auth.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-owned-channels',
  templateUrl: './owned-channels.component.html',
  styleUrls: ['./owned-channels.component.scss']
})
export class OwnedChannelsComponent {

  constructor(
    private auth: AuthService,
    private notification: NzNotificationService) {
  }

  channels$: Observable<Channel> = this.auth.getChannels()
    .pipe(tap(e => console.log(e)));

  deleteChannel(chan: Channel) {
    console.log(chan);
  }

  openSettings(chan: Channel) {
    console.log(chan);
  }

}
