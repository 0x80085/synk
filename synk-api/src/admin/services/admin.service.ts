import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginateRawAndEntities, Pagination } from 'nestjs-typeorm-paginate';
import { ConnectionTrackingService } from 'src/chat/services/connection-tracking.service';
import { Repository } from 'typeorm';

import { Channel, Member } from '../../domain/entity';

@Injectable()
export class AdminService {

    constructor(
        @InjectRepository(Channel)
        private readonly channelRepository: Repository<Channel>,
        @InjectRepository(Member)
        private readonly memberRepository: Repository<Member>,
        private trackingService: ConnectionTrackingService,
    ) { }

    async getPaginatedChannels(options: IPaginationOptions): Promise<Pagination<Channel>> {
        return this.getChannelsWithOwner(options);
    }

    async getPaginatedMembers(options: IPaginationOptions): Promise<Pagination<Member>> {
        return this.getMembersWithChannels(options)
    }

    public getConnections() {
        const clients: any[] = [];

        [...this.trackingService.clients]
            .map(([ip, value]) => ({ ip, value: value.map(v => ({ socketId: v.client.id, memberId: v.memberId })) }))
            .map(({ ip, value }) => {
                value.forEach(it => {
                    clients.push({ ip, ...it })
                })
            });

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
