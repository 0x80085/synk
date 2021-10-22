import { HttpModule, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { AuthModule } from 'src/auth/auth.module';
import { TvModule } from 'src/tv/tv.module';
import { Channel, Session, Member, Role, ChannelConfig } from '../domain/entity';

import { ChannelController } from './controllers/channel.controller';
import { RoomMessagesGateway } from './gateways/room-messages.gateway';
import { AddMediaToRoomHandler } from './handlers/add-media-to-room-playlist.handler';
import { ChannelService } from './services/channel.service';
import { ConnectionTrackingService } from './services/connection-tracking.service';
import { RoomService } from './services/room.service';

export const CommandHandlers = [
  AddMediaToRoomHandler
];

export const QueryHandlers = [
  // GetOwnRoomsHandler,
  // GetRoomConfigHandler,
  // GetRoomsHandler,
];


export const EventHandlers = [
  // NewMemberCreatedHandler,
  // MemberDeletedHandler,
  // MemberUpdatedHandler
];

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, Member, Session, Role, ChannelConfig]),
    CqrsModule,
    AuthModule,
    TvModule,
    HttpModule,
  ],
  controllers: [
    ChannelController
  ],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    ChannelService,
    RoomService,
    RoomMessagesGateway,
    ConnectionTrackingService,
  ],
  exports:[
    ChannelService,
    RoomService,
    ConnectionTrackingService
  ]
})
export class ChatModule { }
