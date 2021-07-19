import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { LocalStrategy } from './local.strategy';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from 'src/domain/entity';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { LocalSerializer } from './local.serializer';
import { ConnectionTrackingService } from 'src/chat/services/connection-tracking.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member]),
    PassportModule.register({
      session: true
    })
  ],
  providers: [
    AuthService,
    ConnectionTrackingService,
    LocalStrategy,
    LocalAuthGuard,
    AuthenticatedGuard,
    LocalSerializer,
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    AuthenticatedGuard
  ]
})
export class AuthModule { }
