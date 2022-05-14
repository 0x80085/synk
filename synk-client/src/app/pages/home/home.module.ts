import { NgModule } from '@angular/core';

import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzProgressModule } from 'ng-zorro-antd/progress';

import { HomeComponent } from './home.component';
import { OverviewComponent } from './overview/overview.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SushiBannerComponent } from './banners/sushi-banner/sushi-banner.component';
import { PopcornBannerComponent } from './banners/popcorn-banner/popcorn-banner.component';
import { NekoBannerComponent } from './banners/neko-banner/neko-banner.component';
import { OverviewItemComponent } from './overview/overview-item/overview-item.component';
import { RouterModule } from '@angular/router';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NZ_ICONS } from 'src/app/icons';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzAlertModule,
    NzCarouselModule,
    NzDividerModule,
    NzListModule,
    NzEmptyModule,
    NzCardModule,
    NzToolTipModule,
    NzButtonModule,
    NzGridModule,
    NzTypographyModule,
    NzImageModule,
    NzProgressModule,
    NzIconModule.forRoot(NZ_ICONS)
  ],
  declarations: [
    HomeComponent,
    OverviewComponent,
    SushiBannerComponent,
    PopcornBannerComponent,
    NekoBannerComponent,
    OverviewItemComponent
  ],
  exports: [HomeComponent]
})
export class HomeModule { }
