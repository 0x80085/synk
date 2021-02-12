import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NgZorroAntdModule } from 'ng-zorro-antd';
import { PlyrModule } from 'ngx-plyr';

import { ChannelComponent } from './channel.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { ChatService } from './chat.service';
import { Html5Component } from './media/html5/html5.component';
import { MediaComponent, MediaHostDirective } from './media/media.component';
import { TwitchComponent } from './media/twitch/twitch.component';
import { YoutubeComponent } from './media/youtube/youtube.component';
import { PlayerDebugComponent } from './player-debug/player-debug.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { PlyrComponent } from './media/plyr/plyr.component';
import { ConnectedMembersComponent } from './connected-members/connected-members.component';

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
    PlayerDebugComponent,
    TwitchComponent,
    PlyrComponent,
    ConnectedMembersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgZorroAntdModule,
    PlyrModule
  ],
  providers: [ChatService]
})
export class ChannelModule { }
