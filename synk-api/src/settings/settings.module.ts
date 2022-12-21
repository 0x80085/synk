import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GlobalSettings } from 'src/domain/entity';
import { GlobalSettingsService } from './global-settings.service';
import { SettingsController } from './controllers/settings.controller';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([GlobalSettings]),
    //   CqrsModule,
    //   AuthModule,
    //   TvModule,
    //   HttpModule,
  ],
  controllers: [SettingsController],
  providers: [GlobalSettingsService],
  exports: [GlobalSettingsService],
})
export class SettingsModule {}
