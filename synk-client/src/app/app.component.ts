import { Component } from '@angular/core';
import { AppStateService } from './app-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  isCollapsed = true;

  isLoggedIn = this.state.isLoggedIn$;
  isConnected = this.state.isSocketConnected$;
  user = this.state.me$;

  constructor(private state: AppStateService) { }

}
