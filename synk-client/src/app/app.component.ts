import { Component } from '@angular/core';
import { AppStateService } from './app-state.service';
import { tap } from 'rxjs/operators';
import { SocketService } from './socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  isCollapsed = true;

  isLoggedIn = this.state.isLoggedIn$;
  isConnected = this.socketService.isConnected$.pipe(
    tap((iz) => console.log(iz))
  );
  user = this.state.me$;

  constructor(
    private state: AppStateService,
    private socketService: SocketService
  ) { }

}
