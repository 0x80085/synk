import { Request } from 'express'

import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { ChannelService } from '../services/channel.service';
import { ChannelRepresentation, ChannelShortRepresentation } from '../models/channel/channel.representation';
import { CreateChannelInput } from './create-channel.input';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { SerializedUserData } from 'src/auth/local.serializer';
import { UpdateChannelInput } from './update-channel.input';
import { RoomService } from '../services/room.service';

@ApiTags('Channels')
@Controller('channels')
export class ChannelController {

    constructor(
        private channelService: ChannelService,
        private roomService: RoomService
        ) { }

    @Get('/all')
    @ApiOperation({ summary: 'Get all public channels' })
    async getPublicChannels(): Promise<ChannelShortRepresentation[]> {

        return await this.channelService.getPubliclyListed();

    }

    @Get('/automated')
    @ApiOperation({ summary: 'Get all automated channels' })
    async getAutomatedChannels(): Promise<ChannelShortRepresentation[]> {

        return this.roomService.automatedRooms.map(({ id, name, members, currentPlaylist }) => ({
            id,
            name,
            connectedMemberCount: members.length,
            nowPlaying: {
                url: currentPlaylist.nowPlaying()?.media?.url,
                title: currentPlaylist.nowPlaying()?.media?.title,
                currentTime: currentPlaylist.nowPlaying().time,
                length: currentPlaylist.nowPlaying().media?.length
            },
            description: "Daily content collected from internet hubs"
        } as ChannelShortRepresentation))

    }
    
    @Get('/mine')
    @UseGuards(AuthenticatedGuard)
    @ApiOperation({ summary: 'Get owned channels of logged in user' })
    async getOwnChannels(
        @Req() { user }: Express.Request,
    ) {

        const { id: ownerId } = user as SerializedUserData;
        return await this.channelService.getChannelsOwnedByMember(ownerId);

    }

    @Get('/:channelId')
    @ApiParam({ name: 'channelId' })
    @ApiOperation({ summary: 'Get channel by id' })
    async getById(@Param('channelId') channelId): Promise<ChannelRepresentation> {

        return await this.channelService.getById(channelId);

    }

    @Post('')
    @UseGuards(AuthenticatedGuard)
    @ApiOperation({ summary: 'Create a channel' })
    async createChannel(
        @Req() { user }: Request,
        @Body() { description, name, isPublic }: CreateChannelInput) {

        const { id: ownerId } = user as SerializedUserData;
        return await this.channelService.createChannel(name, ownerId, description, isPublic);

    }

    @Patch('/:channelId')
    @UseGuards(AuthenticatedGuard)
    @ApiParam({ name: 'channelId' })
    @ApiOperation({ summary: 'Update a channel' })
    async updateChannel(
        @Req() { user }: Request,
        @Param('channelId') channelId: string,
        @Body() input: UpdateChannelInput) {

        const { id: ownerId } = user as SerializedUserData;
        return await this.channelService.updateChannel(channelId, ownerId, input);

    }

    @Post('/:channelId/moderator/:memberId/level/:level')
    @UseGuards(AuthenticatedGuard)
    @ApiOperation({ summary: 'Assign moderator of level to channel' })
    async assignModerator(
        @Req() { user }: Express.Request,
        @Param('memberId') memberId: string,
        @Param('channelId') channelId: string,
        @Param('level') level: number) {

        const { id: ownerId } = user as SerializedUserData;
        await this.channelService.assignModerator(channelId, memberId, level, ownerId);

    }

    @Delete('/:channelId/moderator/:memberId/level/:level')
    @UseGuards(AuthenticatedGuard)
    @ApiOperation({ summary: 'Remove moderator of channel' })
    async removeModerator(
        @Req() { user }: Express.Request,
        @Param('memberId') memberId: string,
        @Param('channelId') channelId: string,
        @Param('level') level: number) {

        const { id: ownerId } = user as SerializedUserData;
        await this.channelService.removeModerator(channelId, memberId, level, ownerId);

    }

    @Delete('/:channelId')
    @UseGuards(AuthenticatedGuard)
    @ApiOperation({ summary: 'Remove a room' })
    async removeChannel(
        @Req() { user }: Express.Request,
        @Param('channelId') channelId: string) {

        const { id: ownerId } = user as SerializedUserData;
        await this.channelService.removeChannel(channelId, ownerId);

    }

}
