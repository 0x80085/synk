import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NzIconModule  } from 'ng-zorro-antd/icon';


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
import { NzNotificationService } from 'ng-zorro-antd/notification';

registerLocaleData(en);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    IconsProviderModule,
    NzIconModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    HomeModule,
    ChannelModule,
    AccountModule,
    MetaModule,
  ],
  providers: [
    { provide: NZ_I18N, useValue: en_US },
    SocketService,
    AppStateService,
    NzNotificationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
