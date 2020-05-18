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
import { WelcomeModule } from './pages/welcome/welcome.module';
import { ChannelModule } from './pages/channel/channel.module';
import { AccountModule } from './pages/account/account.module';
import { AppStateService } from './app-state.service';
import { SocketService } from './socket.service';

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
    WelcomeModule,
    ChannelModule,
    AccountModule
  ],
  providers: [
    { provide: NZ_I18N, useValue: en_US },
    AppStateService,
    SocketService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
