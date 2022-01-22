import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel, ChannelConfig, Member, Role, Roles } from '../../domain/entity';
import { Repository } from 'typeorm';
import { Room } from '../models/room/room';
import { AutomatedRoom } from '../models/automated-room/automated-room';
import { RedditCrawlerService } from 'src/tv/crawlers/reddit.crawler.service';
import { YoutubeV3Service } from 'src/tv/crawlers/youtube-v3.service';

export const DEFAULT_MAX_USER_COUNT = 100;

@Injectable()
export class RoomService {

    private communityRooms: Room[] = [];

    automatedRooms: AutomatedRoom[] = [];

    private readonly logger = new Logger(RoomService.name);

    constructor(
        @InjectRepository(Channel)
        private channelRepository: Repository<Channel>,
        @InjectRepository(Member)
        private memberRepository: Repository<Member>,
        private redditScraper: RedditCrawlerService,
        private ytService: YoutubeV3Service,
        // @InjectRepository(Role)
        // private roleRepository: Repository<Role>,
        // @InjectRepository(ChannelConfig)
        // private configRepository: Repository<ChannelConfig>,
    ) {
        // TODO load automated rooms from DB and start them
        this.automatedRooms = [
            new AutomatedRoom("The Daily Scraper","Random content collected from internet hubs", redditScraper, ytService, ['videos', 'anime', 'publicfreakout', 'mealtimevideos',]),
            new AutomatedRoom("the_wired","Popular tech videos around the web" ,redditScraper, ytService, ['gaming', 'btc', 'bitcoin', 'cryptocurrencies', 'nintendo', 'ps5'])
        ];

        this.logger.log(`Created ${this.automatedRooms.length} Automated Channels`)

        this.logger.log(`Querying DB for Channels to create room objects from...`)

        this.channelRepository
            .createQueryBuilder("channel")
            .leftJoinAndSelect("channel.owner", "owner")
            // .leftJoinAndSelect("channel.playlists", "playlists")
            .leftJoinAndSelect("channel.roles", "roles")
            .leftJoinAndSelect("channel.configs", "config")
            .getMany()
            .then(channels => {
                this.logger.log(`Discovered ${channels.length} channels, initializing corresponding rooms.`)
                channels.forEach(channel => {
                    const room = new Room(channel.id, channel.name, channel.owner, channel.password);
                    const config = channel.configs?.find(c => c.isActivated);

                    room.moderators = channel.roles.
                        filter(role => role.name = Roles.moderator)
                        .map(({ level, member }) => ({ level, member }))
                    room.maxUsers = config?.maxUsers || DEFAULT_MAX_USER_COUNT;

                    this.communityRooms.push(room);

                })
            })
            .then(() => this.logger.log(`Initialized Room list, created ${this.communityRooms.length} rooms`))
            .catch((error) => this.logger.error(error, 'FAILED to create rooms from channels!!'));
    }

    addRoom({ name, id }: Channel, owner: Member, moderators?: { member: Member, level: number }[]) {
        const room = new Room(id, name, owner);
        this.communityRooms.push(room);
        room.moderators = moderators || [];
        room.maxUsers = DEFAULT_MAX_USER_COUNT;
        this.logger.log(`[${owner.username}] created channel [${room.name}] [${id}]!!`);
    }

    deleteRoom(requestingMember: Member, roomId: string) {
        const room = this.getRoomById(roomId) as Room;
        if (!room) {
            return;
        }
        if (room.owner.id == requestingMember.id || requestingMember.isAdmin) {
            this.communityRooms = this.communityRooms.filter(({ id }) => id != roomId);
        } else {
            throw new UnauthorizedException();
        }
    }

    leaveRoom(roomId: string, member: Member) {
        this.automatedRooms
            .find(r => r.id === roomId)
            ?.enter(member);

        this.communityRooms
            .find(r => r.id === roomId)
            ?.leave(member);
    }

    async giveLeader(roomId: string, requestingMember: Member, newLeaderName: string) {
        const targetedMember = await this.memberRepository.findOneOrFail({ where: { username: newLeaderName } });
        // Only mods, admins and leaders can assign other members as leaders
        this.communityRooms
            .find(r => r.id === roomId)
            ?.makeLeader(requestingMember, targetedMember);
        return targetedMember
    }

    getRoomById(id: string,) {
        return this.communityRooms
            .find(r => r.id === id);
    }

    getRoomByName(name: string,) {
        return this.communityRooms
            .find(r => r.name === name);
    }

    getAutomatedRoom(name: string) {
        return this.automatedRooms
            .find(r => r.name === name);
    }

    updateRoom(roomId: string, maxUsers: number, password?: string) {
        this.communityRooms
            .find(r => r.id === roomId)
            ?.update(maxUsers, password);
    }

}
