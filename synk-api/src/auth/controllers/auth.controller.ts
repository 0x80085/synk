import { Body, Controller, InternalServerErrorException, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConnectionTrackingService } from 'src/chat/services/connection-tracking.service';

import { AuthenticatedGuard } from '../guards/authenticated.guard';
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
        @Body() { username }: LoginInput) {
        this.logger.log(`[${username}] logged in`);
    }

    @Post('/sign-up')
    @ApiOperation({ summary: 'Sign up user' })
    async signup(
        @Body() { password, username }: LoginInput) {
        await this.authService.createAccount(username, password);
        this.logger.log(`[${username}] signed up`);

    }

    @Post('/logout')
    @ApiOperation({ summary: 'Log out' })
    async logout(
        @Req() req: any) {
        try {
            const username = req.user.username;
            req.logOut();
            req.logout();
            this.logger.log(`[${username}] logged out`);
            try {
                const reqIp = this.tracker.getIpFromRequest(req);
                const sockets = this.tracker.getSocketsByMemberIdAndIpAddress((req.user as any).id, reqIp);
                sockets.forEach(socket => socket.disconnect());
            } catch (error) {

            }
        } catch (error) {
            this.logger.warn(`logout failed`);
            this.logger.warn(error);
            throw new InternalServerErrorException();
        }
    }
}

