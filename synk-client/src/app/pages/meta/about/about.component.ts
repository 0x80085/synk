import { Component } from '@angular/core';

import { MetaService } from '../meta.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {

  version$ = this.metaService.version$;

  constructor(private metaService: MetaService) { }
}
