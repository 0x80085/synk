import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChannelComponent } from './channel.component';
import { ChannelRoutingModule } from './channel-routing.module';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { ChatService } from './chat.service';
import { MediaComponent, MediaHostDirective } from './media/media.component';
import { YoutubeComponent } from './media/youtube/youtube.component';

@NgModule({
  entryComponents: [
    YoutubeComponent
  ],
  declarations: [
    ChannelComponent,
    ChatRoomComponent,
    MediaComponent,
    MediaHostDirective,
    YoutubeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ChannelRoutingModule,
    NgZorroAntdModule
  ],
  providers: [ChatService]
})
export class ChannelModule { }
