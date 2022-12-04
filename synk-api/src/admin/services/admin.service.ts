import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginateRawAndEntities, Pagination } from 'nestjs-typeorm-paginate';
import { ConnectionTrackingService } from 'src/chat/services/connection-tracking.service';
import { Repository } from 'typeorm';

import { Channel, GlobalSettings, GLOBAL_SETTINGS_NAME, Member } from '../../domain/entity';

@Injectable()
export class AdminService {

    constructor(
        @InjectRepository(GlobalSettings)
        private readonly settingsRepository: Repository<GlobalSettings>,
        @InjectRepository(Channel)
        private readonly channelRepository: Repository<Channel>,
        @InjectRepository(Member)
        private readonly memberRepository: Repository<Member>,
        private trackingService: ConnectionTrackingService,
    ) { }

    getPaginatedChannels(options: IPaginationOptions): Promise<Pagination<Channel>> {
        return this.getChannelsWithOwner(options);
    }

    getPaginatedMembers(options: IPaginationOptions): Promise<Pagination<Member>> {
        return this.getMembersWithChannels(options)
    }

    async getGlobalSettings(){
        const [settings] = await this.settingsRepository.find({where: {name: GLOBAL_SETTINGS_NAME}});
        return settings
    }
    
    async patchGlobalSettings(input: GlobalSettings) {
        const [settings] = await this.settingsRepository.find({where: {name: GLOBAL_SETTINGS_NAME}});
        if (settings) {
            await this.settingsRepository.update(settings, input)
        } else {
            const nuSettings = this.settingsRepository.create({
                ...input
            });
            await this.settingsRepository.save(nuSettings)
        }
    }

    getConnections() {
        const clients: any[] = [];

        [...this.trackingService.clients]
            .map(([, value]) => ({ value: value.map(v => ({ socketId: v.client.id, memberId: v.memberId })) }));

        const members = [...this.trackingService.memberInRoomTracker].map(([memberId, roomConnections]) => ({ memberId, roomConnections }))

        return { clients, members }
    }

    private async getChannelsWithOwner(options: IPaginationOptions) {
        const query = this.channelRepository
            .createQueryBuilder("channel")
            .leftJoinAndSelect("channel.owner", "owner")
            .orderBy('channel.dateCreated', 'DESC');

        const [pagination] = await paginateRawAndEntities(query, options);
        const patchedResults = pagination.items.map((item, _) => {
            const patchedItem = { ...item };
            const patchedOwner = { ...patchedItem.owner, passwordHash: null } as Member;
            patchedItem.owner = patchedOwner as Member;
            return patchedItem
        });

        const clone = { ...pagination };

        clone.items = patchedResults;

        return clone;
    }

    private async getMembersWithChannels(options: IPaginationOptions) {
        const query = this.memberRepository
            .createQueryBuilder("member")
            .leftJoinAndSelect("member.channels", "channels")
            .orderBy('member.lastSeen', 'DESC');

        const [pagination] = await paginateRawAndEntities(query, options);
        const patchedResults = pagination.items.map((item, _) => {
            const patchedItem = { ...item };
            delete patchedItem.passwordHash
            return patchedItem
        });

        const clone = { ...pagination };

        clone.items = patchedResults;

        return clone;
    }

}
