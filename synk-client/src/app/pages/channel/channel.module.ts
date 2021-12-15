import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PlyrModule } from 'ngx-plyr';

import { NzListModule } from 'ng-zorro-antd/list';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { DragDropModule } from '@angular/cdk/drag-drop';

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
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NZ_ICONS } from 'src/app/icons';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';

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
    ConnectedMembersComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PlyrModule,
    NzListModule,
    NzDividerModule,
    NzCardModule,
    NzFormModule,
    NzEmptyModule,
    NzButtonModule,
    NzInputModule,
    NzCollapseModule,
    NzToolTipModule,
    NzGridModule,
    NzTypographyModule,
    NzDividerModule,
    NzAlertModule,
    NzTabsModule ,
    DragDropModule,
    NzDescriptionsModule,
    NzIconModule.forRoot(NZ_ICONS),
  ],
  providers: [ChatService]
})
export class ChannelModule { }
