import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ChannelOverviewItem, OverviewService } from '../overview.service';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['overview.component.scss']
})
export class OverviewComponent {
  
  communityRooms$: Observable<ChannelOverviewItem[]> = this.overviewService.getChannels()
    .pipe(
      catchError(() => of([])
      )
    );

  automatedRooms$: Observable<ChannelOverviewItem[]> = this.overviewService.getAutomatedChannels()
    .pipe(
      catchError(() => of([])
      )
    );

  constructor(private overviewService: OverviewService) { }
}
