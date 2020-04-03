import { Component, OnInit, Input } from '@angular/core';
import { OverviewlistItem } from '../../overview.service';

@Component({
  selector: 'app-overview-item',
  templateUrl: './overview-item.component.html',
  styleUrls: ['./overview-item.component.scss']
})
export class OverviewItemComponent implements OnInit {

  @Input() item: OverviewlistItem;

  constructor() { }

  ngOnInit() {
  }

}
