import { Component } from '@angular/core';
import { AppStateService } from './app-state.service';
import { map, withLatestFrom } from 'rxjs/operators';
import { SocketService } from './socket.service';
import { AuthService } from './pages/account/auth.service';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  isCollapsed = true;

  hostName = window.location.hostname;

  isLoggedIn = this.state.isLoggedIn$;
  isConnected = this.socketService.isConnected$;

  isAdmin$ = this.isLoggedIn.pipe(
    withLatestFrom(this.state.isAdmin$),
    map(([isAdmin, isLoggedIn]) => isAdmin && isLoggedIn)
  );

  user$ = this.auth.getUser(true)

  constructor(
    private auth: AuthService,
    private state: AppStateService,
    private socketService: SocketService,
    private router: Router
  ) {
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

  }

}
