import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgZorroAntdModule } from 'ng-zorro-antd';

import { AboutComponent } from './about/about.component';

@NgModule({
  declarations: [AboutComponent],
  imports: [
    CommonModule,
    NgZorroAntdModule
  ]
})
export class MetaModule { }
