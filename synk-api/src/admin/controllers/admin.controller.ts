import { Controller, Delete, Get, InternalServerErrorException, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Pagination } from 'nestjs-typeorm-paginate';
import { SerializedUserData } from 'src/auth/local.serializer';
import { ChannelService } from 'src/chat/services/channel.service';
import { RoomService } from 'src/chat/services/room.service';
import { RedditCrawlerService } from 'src/tv/crawlers/reddit.crawler.service';
import { Channel, Member } from '../../domain/entity';
import { AdminGuard } from '../guards/admin.guard';
import { AdminService } from '../services/admin.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {

    constructor(
        private adminService: AdminService,
        private channelService: ChannelService,
        private roomService: RoomService,
        private scrapeSubredditsJob: RedditCrawlerService
    ) { }

    @Get('/channels')
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Get all channels' })
    async getChannels(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
    ): Promise<Pagination<Channel>> {

        limit = getLimit(limit);
        return this.adminService.getPaginatedChannels({ page, limit, });
    }

    @Delete('/channels/:channelId')
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Delete a channel by id' })
    async deleteChannel(
        @Req() { user }: Express.Request,
        @Param('channelId') channelId: string
    ): Promise<void> {
        try {
            const { id: userId } = user as SerializedUserData;
            this.roomService.deleteRoom(user as Member, channelId)
            this.channelService.removeChannel(channelId, userId);

        } catch (error) {
            throw new InternalServerErrorException("Something went wrong")
        }
    }

    @Get('/rooms')
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Get all channels' })
    async getRooms(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
    ): Promise<Pagination<Channel>> {

        limit = getLimit(limit);
        return this.adminService.getPaginatedChannels({ page, limit, });
    }

    @Get('/members')
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Get all members' })
    async getMembers(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
    ): Promise<Pagination<Member>> {

        limit = getLimit(limit);
        return this.adminService.getPaginatedMembers({ page, limit, });
    }

    @Get('/connections')
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Get all socket connections' })
    getConnections(
    ) {
        return this.adminService.getConnections();
    }

    @Post('/start-scrape-subreddit/:channelName/:subreddit')
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Start Video Scrape Run' })
    @ApiParam({ name: 'subreddit' })
    @ApiParam({ name: 'channelName' })
    startScrape(
        @Param('subreddit') subreddit: string,
        @Param('channelName') channelName: string
    ) {

        this.roomService.automatedRooms.find(it => it.name === channelName)?.startSubredditScraperRun(subreddit);
    }

    @Post('/start-auto-playback/:name')
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Start automated room playback for given automated channel' })
    @ApiParam({ name: 'name' })
    startAutomatedRoomPlayback(@Param('name') name: string) {

        this.roomService.automatedRooms.find(it => it.name === name)?.startPlaying();
    }

    @Post('/start-crawler-job')
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Start subreddit crawl job' })
    startRedditCrawlJob() {

        this.scrapeSubredditsJob.scrapeSubredditsJob()
    }

    @Post('/stop-auto-playback/:name')
    @UseGuards(AdminGuard)
    @ApiParam({ name: 'name' })
    @ApiOperation({ summary: 'Stop automated room playback for given automated channel' })
    stopAutomatedRoomPlayback(@Param('name') name: string) {

        this.roomService.automatedRooms.find(it => it.name === name)?.stopPlaying();
    }

    @Post('/play-next-auto-playback/:name')
    @UseGuards(AdminGuard)
    @ApiParam({ name: 'name' })
    @ApiOperation({ summary: 'Play next media for given automated channel' })
    playNextAutomatedRoomPlaylist(@Param('name') name: string) {
        this.roomService.automatedRooms.find(it => it.name === name)?.playNext()
    }

    @Post('/clear-playlist/:name')
    @UseGuards(AdminGuard)
    @ApiParam({ name: 'name' })
    @ApiOperation({ summary: 'Clear playlist and stop automated room playback for given automated channel' })
    clearAutomatedRoomPlaylist(@Param('name') name: string) {
        this.roomService.automatedRooms.find(it => it.name === name)?.stopPlaying();
        this.roomService.automatedRooms.find(it => it.name === name)?.currentPlaylist.clear();
    }

}

function getLimit(limit: number) {
    limit = limit > 100 ? 100 : limit;
    return limit;
}

