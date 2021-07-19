import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { AuthModule } from 'src/auth/auth.module';
import { Member } from '../domain/entity';
import { AccountController } from './controllers/account.controller';
import { AccountService } from './services/account.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Member]),
        AuthModule
    ],
    controllers: [
        AccountController
    ],
    providers: [AccountService]
})
export class AccountModule { }
