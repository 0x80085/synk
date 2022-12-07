import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { ChannelController } from './chat/controllers/channel.controller';
import {
  Channel,
  ChannelConfig,
  GlobalSettings,
  Playlist,
  Session,
  Member,
  Video,
  Role,
} from './domain/entity/index';
import { RedditController } from './tv/controllers/reddit.controller';
import { TvModule } from './tv/tv.module';
import { removeHeaderInfo } from './util/remove-header-info';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './account/account.module';
import { AdminModule } from './admin/admin.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.example'],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: configService.get('TYPEORM_CONNECTION', 'postgres') as any,
        host: configService.get('TYPEORM_HOST', 'localhost'),
        port: configService.get<number>('TYPEORM_PORT', 5432),
        username: configService.get('TYPEORM_USERNAME', 'user'),
        password: configService.get('TYPEORM_PASSWORD', 'complexpassword'),
        database: configService.get<string>('TYPEORM_DATABASE', 'synk'),
        logging: configService.get('TYPEORM_LOGGING', false),
        synchronize: configService.get('TYPEORM_SYNCHRONIZE', false),
        entities: [
          Channel,
          ChannelConfig,
          GlobalSettings,
          Playlist,
          Session,
          Member,
          Video,
          Role,
        ],
        // entities: configService.get('TYPEORM_ENTITIES').split(','), // cannot use bc  Cannot use import statement outside a modu
        migrations: [configService.get('TYPEORM_MIGRATIONS')],
      }),
    }),
    TypeOrmModule.forFeature([GlobalSettings]),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 99,
    }),
    HttpModule,
    ChatModule,
    TvModule,
    AuthModule,
    AccountModule,
    AdminModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(removeHeaderInfo)
      .forRoutes(AppController, RedditController, ChannelController);
  }
}
