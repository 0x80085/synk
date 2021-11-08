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

    constructor(id: string, name: string, owner: Member, password?: string) {
        this.name = name;
        this.id = id;
        this.owner = owner;

        this.password = password;

        this.currentPlaylist = new Playlist('default', owner, new Date());
        this.playlists.push(this.currentPlaylist);
    }

    enter(member: Member) {
        this.throwIfMemberIsBanned(member);
        this.throwIfMemberAlreadyJoined(member);
        this.members.push(member);
        this.messages.post({ author: { username: "" } as any, content: `${member.username} joined`, isSystemMessage: true })
        if (this.members.length === 1) {
            this.assignNewLeader(this.members[0]) 
        }
    }

    /**
     * Let a room know that a member left so the room can correct the memberlist and assign a new leader position
     * @param member member who leaves the room
     * @returns member who is the new leader if leaving member was the leader. null if room empty or if member wasn't leader.
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
                    newLeader = null;

                    this.currentPlaylist.stopPlaying()
                }
            }

            this.members = this.removeMember(this.members, member);
            this.messages.post({ author: { username: '' } as Member, content: `${member.username} left.`,isSystemMessage: true });

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
        this.messages.post({ author: { username: "" } as any, content: `${member.username} added [${media.title}] to playlist`,isSystemMessage: true });
    }

    removeMediaFromPlaylist(member: Member, url: string) {
        this.throwIfNotPermitted(member, ROOM_ACTION_PERMISSIONS.editPlaylist);
        const target = this.currentPlaylist.selectFromQueue(url);
        if (!target) {
            return
        }
        if (target.addedBy.id !== member.id) {
            throw new ForbiddenException();
        }
        this.currentPlaylist.remove(target.media);
        this.messages.post({ author: { username: "" } as any, content: `${member.username} removed ${target.media.title} from playlist`,isSystemMessage: true });
    }

    moveMediaPositionInPlaylist(member: Member, mediaUrl: string, newPosition: number) {
        this.throwIfNotPermitted(member, ROOM_ACTION_PERMISSIONS.editPlaylist);
        this.currentPlaylist.movePositionInListByMedia(mediaUrl, newPosition);
        const target = this.currentPlaylist.selectFromQueue(mediaUrl);
        this.messages.post({ author: { username: "" } as any, content: `${member.username} moved ${target.media.title} to position ${newPosition}`,isSystemMessage: true });
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
            this.messages.post({ author: member, content, isSystemMessage: false })
        }
    }

    update(isPublic: boolean, maxUsers: number, password?: string) {
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
    }

    private removeLeader() {
        this.leader = null;
    }

    private assignNewLeader(member: Member) {
        this.leader = member;
        this.messages.post({ author: { username: "" } as any, content: `${member.username} is now leader`,isSystemMessage: true });
    }

    private selectFromMembers(member: Member) {
        return this.members.find(m => m.id === member.id);
    }

    private throwIfMemberIsBanned(member: Member) {
        if (this.bannedMemberIds.filter(it => it.id === member.id).length > 0) {
            throw new Error("Banned users cannot room");
        }
    }

    private throwIfNotPermitted({ id: requesterId, isAdmin }: Member, permission: Permission) {

        const requestedBySuperAdmin = isAdmin;

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
