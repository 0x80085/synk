import { NgModule } from '@angular/core';

import { WelcomeComponent } from './welcome.component';
import { OverviewComponent } from './overview/overview.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { CommonModule } from '@angular/common';
import { CreateRoomFormComponent } from './create-room-form/create-room-form.component';
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
    ReactiveFormsModule,
    NgZorroAntdModule
  ],
  declarations: [
    WelcomeComponent,
    OverviewComponent,
    CreateRoomFormComponent,
    SushiBannerComponent,
    PopcornBannerComponent,
    NekoBannerComponent,
    OverviewItemComponent
  ],
  exports: [WelcomeComponent]
})
export class WelcomeModule { }
