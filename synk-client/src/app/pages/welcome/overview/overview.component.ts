import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { OverviewlistItem, OverviewService } from '../overview.service';
import { share } from 'rxjs/operators';
import { AppStateService } from '../../../app-state.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['overview.component.scss']
})
export class OverviewComponent {

  data$: Observable<OverviewlistItem[]> = this.overviewService.getChannels().pipe(share());

  isLoggedIn$ = this.state.isLoggedIn$.pipe(share());

  constructor(private overviewService: OverviewService, private state: AppStateService) { }
}
