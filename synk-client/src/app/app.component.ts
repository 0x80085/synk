import { Component } from '@angular/core';
import { AppStateService } from './app-state.service';
import { map, withLatestFrom } from 'rxjs/operators';
import { SocketService } from './socket.service';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isLoggedIn = this.state.isLoggedInAndConnected$;
  isConnected = this.socketService.isConnected$;

  isAdmin$ = this.isLoggedIn.pipe(
    withLatestFrom(this.state.isAdmin$),
    map(([isAdmin, isLoggedIn]) => isAdmin && isLoggedIn)
  );

  constructor(
    private state: AppStateService,
    private socketService: SocketService,
    private router: Router
  ) {
    this.router.events.subscribe(this.scrollUpOnNavigatePage);
  }

  private scrollUpOnNavigatePage(event: RouterEvent) {
    if (event instanceof NavigationEnd) {
      window.scrollTo({ top: 0 });
    }
  }
}
