import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
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

  channels$: Observable<Channel[]> = this.auth.userOwnedChannels$;

  deleteChannel(chan: Channel, ev: Event) {
    if (confirm(`You really want to delete ${chan.name}?`)) {
      ev.preventDefault();
      this.auth.deleteChannel(chan.id)
        .pipe(
          tap(() => this.auth.refreshChannels()),
          take(1)
          , catchError((err) => {
            this.notification.error('Delete failed', 'try again later');
            return err;
          }))
        .subscribe(() => this.auth.refreshChannels());
      return false;
    }
  }

}
