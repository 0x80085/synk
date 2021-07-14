import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { OverviewlistItem, OverviewService } from '../overview.service';
import { catchError, share } from 'rxjs/operators';
import { AppStateService } from '../../../app-state.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['overview.component.scss']
})
export class OverviewComponent {

  data$: Observable<OverviewlistItem[]> = this.overviewService.getChannels().pipe(share(),catchError(() => of([])));

  isLoggedIn$ = this.state.isLoggedIn$.pipe(share());

  constructor(private overviewService: OverviewService, private state: AppStateService) { }
}
