import { Component } from '@angular/core';
import { AppStateService } from './app-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  isCollapsed = true;

  isLoggedIn = this.state.isLoggedIn$.pipe();
  isConnected = this.state.isSocketConnected$.pipe();

  constructor(private state: AppStateService) { }

}
