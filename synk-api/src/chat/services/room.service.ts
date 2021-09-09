import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel, ChannelConfig, Member, Role, Roles } from '../../domain/entity';
import { Repository } from 'typeorm';
import { Room } from '../models/room/room';

export const DEFAULT_MAX_USER_COUNT = 100;

@Injectable()
export class RoomService {

    private roomsList: Room[] = [];

    private readonly logger = new Logger(RoomService.name);

    constructor(
        @InjectRepository(Channel)
        private channelRepository: Repository<Channel>,
        @InjectRepository(Member)
        private memberRepository: Repository<Member>,
        // @InjectRepository(Role)
        // private roleRepository: Repository<Role>,
        // @InjectRepository(ChannelConfig)
        // private configRepository: Repository<ChannelConfig>,
    ) {
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
                    const room = new Room(channel.id, channel.name, channel.owner, channel.isPublic, channel.password);
                    const config = channel.configs?.find(c => c.isActivated);

                    room.moderators = channel.roles.
                        filter(role => role.name = Roles.moderator)
                        .map(({ level, member }) => ({ level, member }))
                    room.maxUsers = config?.maxUsers || DEFAULT_MAX_USER_COUNT;

                    this.roomsList.push(room);
                })
            })
            .then(() => this.logger.log(`Initialized Room list, created ${this.roomsList.length} rooms`))
            .catch((error) => this.logger.error(error, 'FAILED to create rooms from channels!!'));
    }

    addRoom({ name, id, isPublic }: Channel, owner: Member, moderators?: { member: Member, level: number }[]) {
        const room = new Room(id, name, owner, isPublic);
        this.roomsList.push(room);
        room.moderators = moderators || [];
        room.maxUsers = DEFAULT_MAX_USER_COUNT;
        this.logger.log(`[${owner.username}] created channel [${room.name}] [${id}]!!`);
    }

    deleteRoom(requestingMember: Member, roomId: string) {
        const room = this.getRoomById(roomId);
        if (!room) {
            return
        }
        if (room.owner.id == requestingMember.id || requestingMember.isAdmin) {
            this.roomsList = this.roomsList.filter(({ id }) => id != roomId);
        } else {
            throw new UnauthorizedException();
        }
    }

    joinRoom(name: string, member: Member) {
        this.roomsList
            .find(r => r.name === name)
            ?.enter(member);
    }

    leaveRoom(roomId: string, member: Member) {
        this.roomsList
            .find(r => r.id === roomId)
            ?.leave(member);
    }

    voteSkip(roomId: string, member: Member) {
        this.roomsList
            .find(r => r.id === roomId)
            ?.voteSkip(member);
    }

    async giveLeader(roomId: string, requestingMember: Member, newLeaderName: string) {
        const targetedMember = await this.memberRepository.findOneOrFail({ where: { username: newLeaderName } });
        // Only mods, admins and leaders can assign other members as leaders
        this.roomsList
            .find(r => r.id === roomId)
            ?.makeLeader(requestingMember, targetedMember);
        return targetedMember
    }

    getRoomById(id: string,) {
        return this.roomsList
            .find(r => r.id === id);
    }

    getRoomByName(name: string,) {
        return this.roomsList
            .find(r => r.name === name);
    }

    updateRoom(roomId: string, isPublic: boolean, maxUsers: number, password?: string) {
        this.roomsList
            .find(r => r.id === roomId)
            ?.update(isPublic, maxUsers, password);
    }

}
