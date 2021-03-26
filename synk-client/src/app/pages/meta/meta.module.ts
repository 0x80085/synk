import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';

import { AboutComponent } from './about/about.component';

@NgModule({
  declarations: [AboutComponent],
  imports: [
    CommonModule,
    NzStatisticModule,
    NzLayoutModule,
  ]
})
export class MetaModule { }
