
import { Body, Controller, Delete, ForbiddenException, Get, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from 'src/auth/services/auth.service';

import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { SerializedUserData } from '../../auth/local.serializer';
import { Member } from '../../domain/entity';
import { ChangePasswordInput } from '../models/change-password.input';
import { UpdateAccountInput } from '../models/update-account.input';
import { AccountService } from '../services/account.service';

@ApiTags('Account')
@Controller('account')
export class AccountController {

    constructor(private accountService: AccountService, private authService: AuthService) { }

    @Get('')
    @UseGuards(AuthenticatedGuard)
    @ApiOperation({ summary: 'Get member account info' })
    async getAccount(
        @Req() { user }: Request,
    ): Promise<Member> {

        const { id } = user as SerializedUserData;
        return await this.accountService.getMemberAccount(id);

    }

    @Patch('')
    @UseGuards(AuthenticatedGuard)
    @ApiOperation({ summary: 'Update member account info' })
    async updateAccount(
        @Req() { user }: Request,
        @Body() input: UpdateAccountInput
    ) {

        const { id } = user as SerializedUserData;
        return await this.accountService.updateAccount(id, input);

    }

    @Post('/change-password')
    @UseGuards(AuthenticatedGuard)
    @ApiOperation({ summary: 'Change member password' })
    async updatePassword(
        @Req() { user }: Request,
        @Body() { newPassword, oldPassword }: ChangePasswordInput
    ) {

        const { id } = user as SerializedUserData;
        return await this.accountService.changePassword(id, oldPassword, newPassword);

    }

    @Delete('')
    @UseGuards(AuthenticatedGuard)
    @ApiOperation({ summary: 'Delete member account' })
    async deleteAccount(
        @Req() req: Request,
        @Res() res: Response
    ) {

        const { user } = req;
        const { id } = user as SerializedUserData;

        if ((user as SerializedUserData).isAdmin) {
            throw new ForbiddenException("Cannot delete an admin account");
        }

        this.authService.disconnectSocketConnections(req);
        await this.accountService.deleteAccount(id);

        await this.authService.logout(req, res);

        res.sendStatus(204);

    }

}
