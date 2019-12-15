import { Component, OnInit } from '@angular/core';

import { AuthService, User } from '../auth.service';
import { tap, map, withLatestFrom, filter } from 'rxjs/operators';
import { merge, Observable } from 'rxjs';
import { AppStateService } from 'src/app/app-state.service';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {


  constructor(
    private auth: AuthService,
    private state: AppStateService,
    private notification: NzNotificationService,
    private router: Router) {
    this.state.me$.subscribe((us) => {
      console.log('#### USER STET', us);

    })
  }

  me$: Observable<User> = new Observable();

  ngOnInit() {
    this.me$ = this.auth.getUser();
  }

  onLogout() {
    this.auth.logout().subscribe(e => {
      console.log(e);
      this.notification.success('Logout', 'User logged out');
      this.router.navigate(['/account', 'login']);
    });
  }

}
