import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TvModule } from 'src/tv/tv.module';

import { AuthModule } from '../auth/auth.module';
import { ChatModule } from '../chat/chat.module';
import { Channel, ChannelConfig, Member, Role } from '../domain/entity';
import { AdminController } from './controllers/admin.controller';
import { AdminGuard } from './guards/admin.guard';
import { AdminService } from './services/admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, Channel, ChannelConfig, Role]),
    AuthModule,
    ChatModule,
    TvModule
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminGuard,
  ]
})
export class AdminModule { }
