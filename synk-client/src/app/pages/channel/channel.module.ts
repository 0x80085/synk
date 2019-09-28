import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChannelComponent } from './channel/channel.component';
import { ChannelRoutingModule } from './channel/channel-routing.module';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ChannelComponent, ChatRoomComponent],
  imports: [
    CommonModule,
    FormsModule,
    ChannelRoutingModule,
    NgZorroAntdModule
  ]
})
export class ChannelModule { }
