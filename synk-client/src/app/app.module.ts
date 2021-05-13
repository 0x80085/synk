import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { IconsProviderModule } from './icons-provider.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeModule } from './pages/home/home.module';
import { ChannelModule } from './pages/channel/channel.module';
import { AccountModule } from './pages/account/account.module';
import { AppStateService } from './app-state.service';
import { SocketService } from './socket.service';
import { MetaModule } from './pages/meta/meta.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzAlertModule } from 'ng-zorro-antd/alert';

registerLocaleData(en);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    IconsProviderModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    HomeModule,
    ChannelModule,
    AccountModule,
    MetaModule,
    NzIconModule,
    NzNotificationModule,
    NzLayoutModule,
    NzMenuModule,
    NzToolTipModule,
    NzButtonModule,
    NzTypographyModule,
    NzAlertModule,
  ],
  providers: [
    { provide: NZ_I18N, useValue: en_US },
    SocketService,
    AppStateService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
