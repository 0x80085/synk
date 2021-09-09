import { Component } from '@angular/core';

import { AuthService, User } from '../auth.service';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { catchError, tap } from 'rxjs/operators';

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
    this.auth.logout().pipe(
      tap(() => {
        this.notification.success('Member logged out', 'Come back soon!');
        this.router.navigate(['/account', 'login']);
      }),
      catchError((e) => {
        console.log(e);
        
        this.notification.error("Nott logged out...", e.message || "Something went wrong")
        return of(e)
      })

    )
      .subscribe();
  }

  onDeleteAccount() {
    if (confirm("WARNING: This permanently deletes your account and any channel or other relation linked to it.")) {
      this.auth.deleteAccount().pipe(
        tap(() => {
          this.router.navigate(['/account', 'register']);
          this.notification.success("Account deleted", "Sorry to see you go, come back anytime!");
        }),
        catchError(err => {
          console.log(err);
          
          this.notification.error("Account NOT deleted...", err.message || "Something went wrong")
          return of(err)
        })
      )
        .subscribe()
    }
  }

}
