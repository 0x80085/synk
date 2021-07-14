import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Channel, ChannelConfig, Member, Role, Roles } from '../../domain/entity';
import { CreateChannelInput } from '../controllers/create-channel.input';
import { ChannelRepresentation, ChannelShortRepresentation, getChannelShortRepresentation, mergeChannelAndRoom } from '../models/channel/channel.representation';
import { getMemberSummary } from '../models/member/member.representation';
import { Room } from '../models/room/room';
import { DEFAULT_MAX_USER_COUNT, RoomService } from './room.service';

@Injectable()
export class ChannelService {

    private readonly logger = new Logger(ChannelService.name);

    constructor(
        @InjectRepository(Channel)
        private channelRepository: Repository<Channel>,
        @InjectRepository(Member)
        private memberRepository: Repository<Member>,
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        @InjectRepository(ChannelConfig)
        private configRepository: Repository<ChannelConfig>,
        private roomService: RoomService
    ) { }

    async createChannel(name: string, ownerId: string, description: string, isPublic: boolean) {
        const member = await this.memberRepository.findOneOrFail({ where: { id: ownerId } })

        await this.throwIfChannelCannotBeCreated(name, member);

        const channel = this.channelRepository.create({
            name,
            description,
            isPublic,
            owner: member,
            id: uuid(),
            dateCreated: new Date(),
            isLocked: false,
        });
        const config = this.configRepository.create({
            name: "default",
            description: "default",
            isActivated: true,
            isPublic: true,
            logFileUrl: "",
            customValue: "",
            MOTD: "",
            bannerUrl: "",
            coverUrl: "",
            logoUrl: "",
            emojiListUrl: "",
            maxUsers: DEFAULT_MAX_USER_COUNT, // TODO Set from globalsettingsservice or so
            channel,
        })

        await this.channelRepository.save(channel);
        await this.configRepository.save(config);

        this.roomService.addRoom(channel, member);
    }

    getPubliclyListed(): Promise<ChannelShortRepresentation[]> {
        return this.channelRepository.find({ where: { isPublic: true } })
            .then(channels => channels.map((channel) => ({ channel, room: this.roomService.getRoomById(channel.id) })))
            .then(entries => entries.map(getChannelShortRepresentation))
            .then((entries) => entries.sort((a, b) => b.connectedMemberCount - a.connectedMemberCount));
    }

    async getById(id: string): Promise<ChannelRepresentation> {
        const moderators = await this.getModeratorsOfChannel(id);
        return this.getChannelAndRoom(id)
            .then(mergeChannelAndRoom)
            .then(channel => {
                channel.moderators = moderators.map(mod => getMemberSummary(mod, null));
                return channel;
            });
    }

    getChannelsOwnedByMember(ownerId: string) {
        return this.memberRepository.findOneOrFail({ where: { id: ownerId } })
            .then(member => this.channelRepository.find({ where: { owner: member } }))
            .then(channels => channels.map((channel) => ({ channel, room: this.roomService.getRoomById(channel.id) })))
            .then(entries => entries.map(getChannelShortRepresentation));
    }

    async updateChannel(channelId: string, ownerId: string, { description, isPublic, maxUsers, name, password }: CreateChannelInput) {
        const owner = await this.memberRepository.findOneOrFail({ where: { id: ownerId } });
        const channel = await this.channelRepository.findOneOrFail({ where: { owner, id: channelId } });
        const channelConfig = await this.configRepository.findOneOrFail({ where: { channel } });
        const room = this.roomService.getRoomById(channel.id);

        channel.description = description;
        channel.isPublic = isPublic;
        channelConfig.maxUsers = maxUsers;
        channel.name = name;
        channel.password = password;

        room.name = name;
        room.isPublic = isPublic;
        room.maxUsers = maxUsers;
        room.password = password;

        this.logger.log(`[${channel.owner.username}] updated channel [${channel.name}] [${channel.id}] !!`);

        await this.configRepository.save(channel);
        await this.configRepository.save(channelConfig);
    }

    getModeratorsOfChannel(channelId: string) {
        return this.roleRepository.find({ where: { channel: { id: channelId } }, relations: ["channel", "member"] })
            .then(roles => roles.map(role => role.member))
    }

    async assignModerator(channelId: string, memberId: string, level: number, ownerId: string) {
        const channel = await this.channelRepository.findOneOrFail({ where: { id: channelId } })
        const owner = await this.memberRepository.findOneOrFail({ where: { id: ownerId } })

        const room = this.roomService.getRoomById(channel.id);
        const newMod = await this.memberRepository.findOneOrFail({ where: { id: memberId } })

        const newRoleDraft = { channel, level, member: newMod, name: Roles.moderator };
        const alreadyExists = this.roleRepository.find({ where: newRoleDraft });

        if (!alreadyExists) {
            const role = this.roleRepository.create(newRoleDraft);
            this.roleRepository.save(role);
            room.makeModerator(owner, newMod, level)
        }
    }

    async removeModerator(channelId: string, memberId: string, level: number, ownerId: string) {
        const channel = await this.channelRepository.findOneOrFail({ where: { id: channelId } })
        const owner = await this.memberRepository.findOneOrFail({ where: { id: ownerId } })

        const moderator = await this.memberRepository.findOneOrFail({ where: { id: memberId } })
        const roleToBeDeleted = await this.roleRepository.findOneOrFail({ where: { member: moderator, level, channel } })
        try {
            const room = this.roomService.getRoomById(channel.id);
            room.removeModerator(owner, moderator);
            await this.roleRepository.remove(roleToBeDeleted);
        } catch (error) {

        }
    }

    async removeChannel(channelId: string, ownerId: string) {
        const channel = await this.channelRepository.findOneOrFail({ where: { id: channelId }, relations: ["configs", "owner"] })
        const owner = await this.memberRepository.findOneOrFail({ where: { id: ownerId } })

        // todo also delete from socketio rooms --> use command or so?
        if (channel.owner.id == ownerId || owner.isAdmin) {
            await this.configRepository.remove(channel.configs);
            await this.channelRepository.remove(channel);
            this.roomService.deleteRoom(owner, channelId);
        }

    }

    private getChannelAndRoom(id: string): Promise<{ room: Room, channel: Channel }> {
        return this.channelRepository.findOneOrFail({ where: { id }, relations: ["owner"] })
            .then(channel => ({ channel, room: this.roomService.getRoomById(channel.id) }));
    }

    private async throwIfChannelCannotBeCreated(name: string, member: Member) {

        const maxRooms = 200;
        const maxChannelsOwnedByUser = 5;

        const isDupelicateName = await this.channelRepository.count({ where: { name } }).then(count => count > 0);
        const hasMaxRoomsBeenReached = await this.channelRepository.count().then(count => count >= maxRooms);
        const hasMaxRoomsBeenReachedForUser = await this.channelRepository.count({ where: { owner: member } }).then(count => count >= maxChannelsOwnedByUser);

        if (isDupelicateName) {
            throw new ConflictException("A channel's name must be unique");
        }
        if (hasMaxRoomsBeenReached) {
            throw new ConflictException("Global max channel quota reached");
        }
        if (hasMaxRoomsBeenReachedForUser) {
            throw new ConflictException("User max channel quota reached");
        }
    }
}