import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ChannelOverviewItem, OverviewService } from '../overview.service';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['overview.component.scss']
})
export class OverviewComponent {

  data$: Observable<ChannelOverviewItem[]> = this.overviewService.getChannels()
    .pipe(
      catchError(() => of([])
      )
    );

  constructor(private overviewService: OverviewService) { }
}
