import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { OverviewlistItem, OverviewService } from '../overview.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['overview.component.css']
})
export class OverviewComponent {

  data$: Observable<OverviewlistItem[]> = this.overviewService.getChannels()
    .pipe(
      tap(de => console.log(de))
    );

  constructor(private overviewService: OverviewService) { }
}
