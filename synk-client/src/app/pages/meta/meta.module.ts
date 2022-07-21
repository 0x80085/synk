import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NZ_ICONS } from 'src/app/icons';

import { AboutComponent } from './about/about.component';
import { TermsOfUseComponent } from './terms-of-use/terms-of-use.component';

@NgModule({
  declarations: [AboutComponent, TermsOfUseComponent],
  imports: [
    RouterModule,
    CommonModule,
    NzStatisticModule,
    NzLayoutModule,
    NzGridModule,
    NzTypographyModule,
    NzButtonModule,
    NzToolTipModule,
    NzIconModule.forRoot(NZ_ICONS),
  ]
})
export class MetaModule { }
