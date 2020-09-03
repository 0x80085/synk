import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd';
import { Observable, of } from 'rxjs';

import { AuthService, User } from '../auth.service';
import { AdminService } from '../admin.service';
import { shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  me$: Observable<User> = this.authService.getUser();
  users$: Observable<User[]> = this.adminService.getUsers().pipe(shareReplay(1));

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private notification: NzNotificationService) {
  }

  ban(user: User, $event) {
    console.log(`banning user [${user.userName}]`);
    this.notification.success('Success', `Banned user [${user.userName}]`);
  }

  ngOnInit(): void {
  }

}