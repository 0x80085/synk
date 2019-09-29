import { NgModule } from '@angular/core';

import { WelcomeRoutingModule } from './welcome-routing.module';

import { WelcomeComponent } from './welcome.component';
import { OverviewComponent } from './overview/overview.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { CommonModule } from '@angular/common';


@NgModule({
  imports: [CommonModule, WelcomeRoutingModule, NgZorroAntdModule],
  declarations: [WelcomeComponent, OverviewComponent],
  exports: [WelcomeComponent]
})
export class WelcomeModule { }
