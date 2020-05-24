import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

import { AuthService, Channel } from '../../auth.service';
import { tap, take, catchError, switchMap } from 'rxjs/operators';

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

  refreshSubject = new BehaviorSubject(null);

  channels$: Observable<Channel[]> = this.refreshSubject.pipe(
    switchMap(() => {
      return this.auth.getChannels()
        .pipe(tap(e => console.log(e))
        );
    })
  );

  deleteChannel(chan: Channel, ev: Event) {
    if (confirm(`You really want to delete ${chan.name}?`)) {
      this.auth.deleteChannel(chan.name)
        .pipe(
          tap(() => this.refreshSubject.next(null)),
          take(1)
          , catchError((err) => {
            this.notification.error('Delete failed', 'try again later')
            return err;
          }))
        .subscribe();
      ev.preventDefault();
      return false;
    }
  }

  openSettings(chan: Channel) {
    console.log(chan);
  }

}
