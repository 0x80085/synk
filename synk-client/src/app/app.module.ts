import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { ChatService } from './chat.service';

@NgModule({
  declarations: [AppComponent, ChatRoomComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [ChatService],
  bootstrap: [AppComponent]
})
export class AppModule {}
