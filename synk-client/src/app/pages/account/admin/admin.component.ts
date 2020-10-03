import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd';
import { Observable } from 'rxjs';
import { map, shareReplay, take, tap } from 'rxjs/operators';

import { AdminService, ChannelResponse, UserAccountInfo, UserInfo, UserOfRoomInfo, UserSocketInfo } from '../admin.service';
import { AuthService, User } from '../auth.service';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  me$: Observable<User> = this.authService.getUser();
  users$: Observable<UserInfo> = this.adminService.getUsers().pipe(shareReplay(1));
  rooms$: Observable<ChannelResponse> = this.adminService.getRooms().pipe(shareReplay(1));

  accounts$: Observable<UserAccountInfo[]> = this.users$.pipe(map(it => it.accounts));
  usersActiveInAtLeastOneRoom$: Observable<UserOfRoomInfo[]> = this.users$.pipe(map(it => it.usersActiveInAtLeastOneRoom));
  usersConnectedToSocketServer$: Observable<UserSocketInfo[]> = this.users$.pipe(map(it => it.usersConnectedToSocketServer));

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
    console.log(`banning user [${user.userName}]`);
    this.notification.success('Success', `Banned user [${user.userName}]`);
  }

  ngOnInit(): void {
  }

}
