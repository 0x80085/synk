import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { forkJoin, from, of, pipe } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
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
        return paginate<Channel>(this.channelRepository, options);
    }

    async getPaginatedMembers(options: IPaginationOptions): Promise<Pagination<Member>> {
        return paginate<Member>(this.memberRepository, options);
    }

    public getConnections() {
        let clients: any[] = [];

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

}
