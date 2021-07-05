import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { AboutComponent } from './about/about.component';

@NgModule({
  declarations: [AboutComponent],
  imports: [
    CommonModule,
    NzStatisticModule,
    NzLayoutModule,
    NzTypographyModule,
    NzIconModule
  ]
})
export class MetaModule { }
