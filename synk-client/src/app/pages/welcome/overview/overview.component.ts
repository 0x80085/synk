import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { OverviewlistItem, OverviewService } from '../overview.service';
import { share } from 'rxjs/operators';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['overview.component.scss']
})
export class OverviewComponent {

  data$: Observable<OverviewlistItem[]> = this.overviewService.getChannels().pipe(share());

  constructor(private overviewService: OverviewService) { }
}
