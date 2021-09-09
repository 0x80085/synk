import { Body, Controller, InternalServerErrorException, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';

import { ConnectionTrackingService } from 'src/chat/services/connection-tracking.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { LoginInput } from '../models/login.input';
import { AuthService } from '../services/auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {

    private readonly logger = new Logger(AuthController.name);

    constructor(private authService: AuthService, private tracker: ConnectionTrackingService) { }

    @Post('/login')
    @UseGuards(LocalAuthGuard)
    @ApiOperation({ summary: 'Log in user' })
    login(
        @Body() { username }: LoginInput
    ) {
        this.logger.log(`[${username}] logged in`);
    }

    @Post('/sign-up')
    @ApiOperation({ summary: 'Sign up user' })
    async signup(
        @Body() { password, username }: LoginInput
    ) {
        await this.authService.createAccount(username, password);
        this.logger.log(`[${username}] signed up`);
    }

    @Post('/logout')
    @ApiOperation({ summary: 'Log out' })
    logout(
        @Req() req: Request,
        @Res() res: Response
    ) {
        try {
            this.authService.logout(req, res);

            this.logger.log(`Member logged out?`);

        } catch (error) {
            this.logger.warn(`logout failed`);
            this.logger.warn(error);

            if (Object.keys(error).length !== 0) {
                throw new InternalServerErrorException();
            }
        }

        res.sendStatus(204)
    }
}

