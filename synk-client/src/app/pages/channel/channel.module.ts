import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChannelComponent } from './channel.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { ChatService } from './chat.service';
import { MediaComponent, MediaHostDirective } from './media/media.component';
import { YoutubeComponent } from './media/youtube/youtube.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { Html5Component } from './media/html5/html5.v2.component';
import { PlayerDebugComponent } from './player-debug/player-debug.component';

@NgModule({
  entryComponents: [
    YoutubeComponent
  ],
  declarations: [
    ChannelComponent,
    ChatRoomComponent,
    MediaComponent,
    MediaHostDirective,
    YoutubeComponent,
    PlaylistComponent,
    Html5Component,
    PlayerDebugComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgZorroAntdModule
  ],
  providers: [ChatService]
})
export class ChannelModule { }
