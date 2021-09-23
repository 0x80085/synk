import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';
import { map, shareReplay, take, tap } from 'rxjs/operators';

import { AdminService, UserAccountInfo, UserInfo } from '../admin.service';
import { Channel, User } from '../auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {

  subreddit: string;

  users$: Observable<UserInfo> = this.adminService.getUsers().pipe(shareReplay(1));
  channels$: Observable<Channel[]> = this.adminService.getChannels().pipe(shareReplay(1));
  connections$ = this.adminService.getConnections().pipe(shareReplay(1));

  accounts$: Observable<UserAccountInfo[]> = this.users$.pipe(map(it => it.items));

  constructor(
    private adminService: AdminService,
    private notification: NzNotificationService) {
  }

  deleteRoom(id: string, name: string) {
    if (confirm(`Sure you want to delete ${name} ??`)) {
      this.adminService.deleteRoom(id)
        .pipe(take(1))
        .subscribe(() => this.notification.success('Success', `Deleted room [${name}]`));
    }
  }

  ban(user: User, $event) {
    console.log(`banning user [${user.username}]`);
    this.notification.success('Success', `Banned user [${user.username}]`);
  }

  startScraper() {
    if (this.subreddit.trim() == "") {
      return
    }
    this.adminService.startScraper(this.subreddit)
      .pipe(
        tap(() => this.notification.success('Success', `Started scrape for [${this.subreddit}]`)),
        tap(() => this.subreddit = "")
      )
      .subscribe()
  }
  stopScraper() {
    this.adminService.stopScraper()
    .pipe(
      tap(() => this.notification.success('Success', `STOPPED scrape`))
    )
    .subscribe()
  }
  startPlayback() {
    this.adminService.startPlayback()
    .pipe(
      tap(() => this.notification.success('Success', `Started auto-playback`))
    )
    .subscribe()
  }
  stopPlayback() {
    this.adminService.stopPlayback()
    .pipe(
      tap(() => this.notification.success('Success', `Stopped auto-playback`))
    )
    .subscribe()
  }
  clearPlaylist() {
    this.adminService.clearPlaylist()
    .pipe(
      tap(() => this.notification.success('Success', `Cleared playlist`))
    )
    .subscribe()
  }

}
