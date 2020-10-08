import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { IconsProviderModule } from './icons-provider.module';
import { NgZorroAntdModule, NZ_I18N, en_US } from 'ng-zorro-antd';
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

registerLocaleData(en);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    IconsProviderModule,
    NgZorroAntdModule,
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
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
