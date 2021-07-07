import { ForbiddenException } from '@nestjs/common';
import { MessageTypes } from 'src/chat/gateways/message-types.enum';
import { Member, Roles } from '../../../domain/entity';
import { Feed } from '../feed/feed';
import { Media } from '../media/media';
import { Playlist, UpdatePlayingStateCommand } from "../playlist/playlist";
import { ROOM_ACTION_PERMISSIONS, Permission } from './permission';

export class Room {
    id: string;
    name: string;

    isPublic: boolean;

    leader?: Member;
    members: Member[] = [];
    moderators: { member: Member, level: number }[] = [];
    owner: Member;
    bannedMemberIds: { id: string, reason: string, date: Date }[] = [];

    messages: Feed = new Feed();

    playlists: Playlist[] = [];
    currentPlaylist: Playlist;
    maxUsers: number;
    password: string;

    constructor(id: string, name: string, owner: Member, isPublic = true, password?: string) {
        this.name = name;
        this.id = id;
        this.owner = owner;

        this.isPublic = isPublic;
        this.password = password;

        this.currentPlaylist = new Playlist('default', owner, new Date());
        this.playlists.push(this.currentPlaylist);
    }

    enter(member: Member) {
        this.throwIfMemberIsBanned(member);
        this.throwIfMemberAlreadyJoined(member);
        this.members.push(member);
        console.log(`[${member.username}] enters [${this.name}]`);
        this.messages.post({ author: { username: "" } as any, content: `${member.username} joined` })
        if (this.members.length === 1) {
            this.leader = this.members[0]
            console.log(`[${member.username}] is leader of [${this.name}]`);
        }
    }

    /**
     * Let a room know that a member left so the room can correct the memberlist and assign a new leader position
     * @param member member who leaves the room
     */
    leave(member: Member): Member | null {
        const toBeRemoved = this.selectFromMembers(member);
        let newLeader;

        if (toBeRemoved) {
            if (this.leader && this.leader.id == member.id) {
                const hasAtleast2MembersInRoom = this.members.length >= 2;
                if (hasAtleast2MembersInRoom) {
                    const elegibleMembers = this.members.filter(m => m.id !== this.leader.id)
                    newLeader = elegibleMembers[0];
                    this.replaceLeader(elegibleMembers[0])
                } else {
                    this.removeLeader();
                    console.log(`[${member.username}] was removed as leader of [${this.name}]`);
                    newLeader = null;
                }
            }

            this.members = this.removeMember(this.members, member);
            console.log(`[${member.username}] left [${this.name}]`);
            console.log(`${member.username} left.`);
            this.messages.post({ author: { username: '' } as Member, content: `${member.username} left.` });
            
            return newLeader;
        } else {
            console.log(`LEAVE ROOM - ${member.username} not found, not removed.`);
        }
    }

    updateNowPlaying(member: Member, { url, time }: UpdatePlayingStateCommand): UpdatePlayingStateCommand {
        this.throwIfNotPermitted(member, ROOM_ACTION_PERMISSIONS.updateNowPlaying);
        return this.currentPlaylist.updateNowPlaying(url, time);
    }

    addMediaToPlaylist(member: Member, media: Media) {
        this.throwIfNotPermitted(member, ROOM_ACTION_PERMISSIONS.editPlaylist);
        this.currentPlaylist.add(media, member);
    }

    removeMediaFromPlaylist(member: Member, url: string) {
        this.throwIfNotPermitted(member, ROOM_ACTION_PERMISSIONS.editPlaylist);
        const target = this.currentPlaylist.selectFromQueue(url);
        if (target.addedBy.id !== member.id) {
            this.throwIfNotPermitted(member, ROOM_ACTION_PERMISSIONS.editPlaylist);
            throw new Error("Couldnt remove video");
        }
        this.currentPlaylist.remove(target.media);
    }

    makeModerator(requestingMember: Member, member: Member, level: number) {
        this.throwIfNotPermitted(requestingMember, ROOM_ACTION_PERMISSIONS.editMods);
        const isAlreadyModerator = this.moderators.filter(mod => mod.member.id === member.id).length > 0;
        if (!isAlreadyModerator) {
            this.moderators.push({ member, level });
        }
    }

    changeModeratorLevel(requestingMember: Member, member: Member, level: number) {
        this.throwIfNotPermitted(requestingMember, ROOM_ACTION_PERMISSIONS.editMods);
        const mod = this.moderators.find(mod => mod.member.id === member.id);
        if (mod) {
            mod.level = level;
        }
    }

    removeModerator(requestingMember: Member, moderator: Member) {
        this.throwIfNotPermitted(requestingMember, ROOM_ACTION_PERMISSIONS.editMods);
        const isModerator = this.moderators.filter(mod => mod.member.id === moderator.id).length > 0;
        if (isModerator) {
            this.moderators.filter(mod => mod.member.id !== moderator.id);
        }
    }

    banMember({ id }: Member, by: Member, reason: string) {
        this.throwIfNotPermitted(by, ROOM_ACTION_PERMISSIONS.banHammer);
        this.bannedMemberIds.push({ id, date: new Date(), reason });
    }

    makeLeader(member: Member, newLeader: Member) {
        this.throwIfNotPermitted(member, ROOM_ACTION_PERMISSIONS.changeLeader);

        if (this.leader) {
            if (this.selectFromMembers(newLeader) != null) {
                this.replaceLeader(newLeader);
            }
        } else {
            this.assignNewLeader(newLeader);
        }
    }

    voteSkip(member: Member) {
        this.currentPlaylist.incrementVoteSkips();
    }

    addMessage(member: Member, content: string) {
        if (this.selectFromMembers(member)) {
            this.messages.post({ author: member, content })
        }
    }

    update(name: string, isPublic: boolean, maxUsers: number, password?: string) {
        this.name = name;
        this.isPublic = isPublic;
        this.maxUsers = maxUsers;
        this.password = password;
    }

    private removeMember(members: Member[], member: Member) {
        var index = members.findIndex(m => m.id === member.id);

        if (index > -1) {
            return [...members.slice(0, index), ...members.slice(index + 1)];
        }

        return members;
    }

    private replaceLeader(member: Member) {
        this.removeLeader();
        this.assignNewLeader(member);
        console.log(`[${member.username}] is now leader of [${this.name}]`);
    }

    private removeLeader() {
        this.leader = null;
    }

    private assignNewLeader(member: Member) {
        this.leader = member;
    }

    private selectFromMembers(member: Member) {
        return this.members.find(m => m.id === member.id);
    }

    private throwIfMemberIsBanned(member: Member) {
        if (this.bannedMemberIds.filter(it => it.id === member.id).length > 0) {
            throw new Error("Banned users cannot room");
        }
    }

    private throwIfNotPermitted({ id: requesterId }: Member, permission: Permission) {

        const requestedBySuperAdmin = false; // TODO

        const isRequestingMemberMod = this.moderators.some(m => m.member.id === requesterId);

        const requestedByMod = permission.minimumRequiredRole === Roles.moderator && isRequestingMemberMod;
        const requestedByAdmin = permission.minimumRequiredRole === Roles.admin && this.owner.id === requesterId;

        const requestedByLeader = permission.isLeaderFeature
            && this.leader.id === requesterId;

        const isLeaderOnlyFeature = permission.isLeaderFeature && permission.minimumRequiredRole === null

        const isFeatureOpenForMembers = permission.minimumRequiredRole === Roles.member;

        const isAllowed = isFeatureOpenForMembers
            || requestedBySuperAdmin
            || requestedByAdmin
            || requestedByMod
            || (isLeaderOnlyFeature && requestedByLeader)
            || requestedByLeader
            ;

        if (!isAllowed) {
            throw new ForbiddenException();
        }
    }

    private throwIfMemberAlreadyJoined(member: Member) {
        const found = this.members.find(m => member.id === m.id)
        if (found) {
            throw new Error(MessageTypes.ALREADY_JOINED);
        }
    }
}
