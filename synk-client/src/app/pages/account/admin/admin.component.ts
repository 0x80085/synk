import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';
import { map, shareReplay, take, tap } from 'rxjs/operators';

import { AdminService, ChannelResponse, UserAccountInfo, UserInfo, UserOfRoomInfo, UserSocketInfo } from '../admin.service';
import { AuthService, Channel, User } from '../auth.service';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  me$: Observable<User> = this.authService.getUser();
  users$: Observable<UserInfo> = this.adminService.getUsers().pipe(shareReplay(1));
  channels$: Observable<Channel[]> = this.adminService.getChannels().pipe(shareReplay(1));
  connections$ = this.adminService.getConnections().pipe(shareReplay(1));

  accounts$: Observable<UserAccountInfo[]> = this.users$.pipe(map(it => it.items));

  constructor(
    private authService: AuthService,
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

  ngOnInit(): void {
  }

}
