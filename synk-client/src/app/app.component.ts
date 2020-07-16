import { Component } from '@angular/core';
import { AppStateService } from './app-state.service';
import { tap, map } from 'rxjs/operators';
import { SocketService } from './socket.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  isCollapsed = true;

  connectionState: Observable<{
    event: string;
    connected: boolean;
  }> = this.socketService.connectionState$;

  isLoggedIn = this.state.isLoggedIn$;
  isConnected = this.connectionState.pipe(map(state => state.connected));



  user = this.state.me$;

  constructor(
    private state: AppStateService,
    private socketService: SocketService
  ) { }

}
