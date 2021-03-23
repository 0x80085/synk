import { NgModule } from '@angular/core';

import { HomeComponent } from './home.component';
import { OverviewComponent } from './overview/overview.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SushiBannerComponent } from './banners/sushi-banner/sushi-banner.component';
import { PopcornBannerComponent } from './banners/popcorn-banner/popcorn-banner.component';
import { NekoBannerComponent } from './banners/neko-banner/neko-banner.component';
import { OverviewItemComponent } from './overview/overview-item/overview-item.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
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
