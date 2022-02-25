import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Channel, ChannelConfig, Member, Role, Roles } from '../../domain/entity';
import { UpdateChannelInput } from '../controllers/update-channel.input';
import { ChannelRepresentation, ChannelShortRepresentation, getChannelShortRepresentation, mergeChannelAndRoom } from '../models/channel/channel.representation';
import { getMemberSummary } from '../models/member/member.representation';
import { Room } from '../models/room/room';
import { DEFAULT_MAX_USER_COUNT, RoomService } from './room.service';

export const VALID_CHANNELNAME_RGX = new RegExp(/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/);
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

        const trimmedName = name.trim();
        const trimmedDescription = description.trim();

        await this.throwIfChannelCannotBeCreated(trimmedName, member);

        const channel = this.channelRepository.create({
            name: trimmedName,
            description: trimmedDescription,
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

    async updateChannel(channelId: string, ownerId: string, { description, isPublic, maxUsers, password }: UpdateChannelInput) {
        const owner = await this.memberRepository.findOneOrFail({ where: { id: ownerId } });
        const channel = await this.channelRepository.findOneOrFail({ where: { owner, id: channelId } });
        const room = this.roomService.getRoomById(channel.id);

        this.channelRepository.createQueryBuilder()
            .update(Channel).set({ isPublic, description }).where("id = :id", { id: channelId })
            .execute()

        this.roomService.updateRoom(channel.id, maxUsers, null)
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
        if (!VALID_CHANNELNAME_RGX.test(name)) {
            throw new BadRequestException("A channel's name must only contain letters, number and dashes or underscores.");
        }

        const maxRooms = 200;
        const maxChannelsOwnedByUser = 5;

        const isDupelicateCommunityChannelName = await this.channelRepository.count({ where: { name } }).then(count => count > 0);
        const hasMaxRoomsBeenReached = await this.channelRepository.count().then(count => count >= maxRooms);
        const hasMaxRoomsBeenReachedForUser = await this.channelRepository.count({ where: { owner: member } }).then(count => count >= maxChannelsOwnedByUser);

        const isDupelicateAutomatedChannelName = this.roomService.automatedRooms.some(room => room.name === name);

        if (isDupelicateCommunityChannelName || isDupelicateAutomatedChannelName) {
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
