import { Component } from '@angular/core';

import { AuthService, User } from '../auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  constructor(
    private auth: AuthService,
    private notification: NzNotificationService,
    private router: Router) {
  }

  me$: Observable<User> = this.auth.getUser();

  onLogout() {
    this.auth.logout().subscribe(e => {
      this.notification.success('Logout', 'User logged out');
      this.router.navigate(['/account', 'login']);
    });
  }

}
