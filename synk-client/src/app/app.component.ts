import { Component } from '@angular/core';
import { AppStateService } from './app-state.service';
import { tap, map, withLatestFrom } from 'rxjs/operators';
import { SocketService } from './socket.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  isCollapsed = true;

  isLoggedIn = this.state.isLoggedIn$;
  isConnected = this.socketService.isConnected$;

  isAdmin$ = this.isLoggedIn.pipe(
    withLatestFrom(this.state.isAdmin$),
    map(([isAdmin, isLoggedIn]) => isAdmin && isLoggedIn)
  );
  user$ = this.state.me$;

  constructor(
    private state: AppStateService,
    private socketService: SocketService
  ) { }

}
