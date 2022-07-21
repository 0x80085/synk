import { ForbiddenException } from '@nestjs/common';
import { MessageTypes } from 'src/chat/gateways/message-types.enum';
import { YouTubeGetID } from 'src/tv/crawlers/youtube-v3.service';
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
    maxUsers: number;
    password: string;

    messages: Feed = new Feed();


    playlists: Playlist[] = [];
    currentPlaylist: Playlist;

    /**
     * Can be decimal between 0 & 1. 
     * Used to calculate the amount of members to voteskip before next media plays.
     * 
     * Example: `0.4` being 40%
     */
    private minRequiredPercentageOfVoteSkippers = 0.5;
    private customMaxVoteSkipRatio = null;

    public get votesNeededForSkip(): number {
        return Math.round(this.customMaxVoteSkipRatio || this.minRequiredPercentageOfVoteSkippers)
    }

    voteSkipCount = 0;
    voterIds: string[] = [];

    constructor(id: string, name: string, owner: Member, password?: string) {
        this.name = name;
        this.id = id;
        this.owner = owner;

        this.password = password;

        this.currentPlaylist = new Playlist('default', owner, new Date());
        this.playlists.push(this.currentPlaylist);
    }

    enter(member: Member) {
        this.throwIfMaxConnectedMemberLimitReached();
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
        console.log(`LEAVE ROOM - executing for ${member.username} .`);

        if (toBeRemoved) {
            if (this.leader && this.leader.id == member.id) {
                const hasAtleast2MembersInRoom = this.members.length >= 2;
                if (hasAtleast2MembersInRoom) {
                    const elegibleMembers = this.members.filter(m => m.id !== this.leader.id)
                    newLeader = elegibleMembers[0];
                    this.replaceLeader(elegibleMembers[0])
                    console.log(`LEAVE ROOM - ${member.username} was leader, assigned new leader ${this.leader?.username}.`);
                } else {
                    console.log(`LEAVE ROOM - ${member.username} was last in room, turning lights off.`);

                    this.removeLeader();
                    newLeader = null;

                    this.currentPlaylist.stopPlaying()
                }
            }

            this.removeMemberSkipVote(member);
            this.members = this.filterOutMember(this.members, member);

            this.messages.post({ author: { username: '' } as Member, content: `${member.username} left.`, isSystemMessage: true });

            console.log(`LEAVE ROOM - ${member.username} removed from ${this.name}.`);
            return newLeader;
        } else {
            console.log(`LEAVE ROOM - ${member.username} not found, not removed from ${this.name}.`);
        }
    }

    updateNowPlaying(member: Member, { url, time }: UpdatePlayingStateCommand): { nowPlaying: UpdatePlayingStateCommand, hasChangedMediaUrl: boolean } {
        this.throwIfNotPermitted(member, ROOM_ACTION_PERMISSIONS.updateNowPlaying);

        const currentUrl = this.currentPlaylist.nowPlaying().media?.url;

        let isMediaUrlDifferentFromNowPlaying = true;

        if (currentUrl) {
            const ytId = YouTubeGetID(currentUrl)
            const ytIdUpdate = YouTubeGetID(url)
            if (currentUrl !== url) {
                isMediaUrlDifferentFromNowPlaying = true;
            }
            if (ytId === ytIdUpdate) {
                isMediaUrlDifferentFromNowPlaying = false;
            }
        } else {
            isMediaUrlDifferentFromNowPlaying = false;
        }
        
        if (isMediaUrlDifferentFromNowPlaying) {
            this.voteSkipCount = 0;
            this.voterIds = [];
        }
        return {
            nowPlaying: this.currentPlaylist.updateNowPlaying(url, time),
            hasChangedMediaUrl: isMediaUrlDifferentFromNowPlaying
        };
    }

    addMediaToPlaylist(member: Member, media: Media) {
        this.throwIfNotPermitted(member, ROOM_ACTION_PERMISSIONS.addToPlaylist);
        this.currentPlaylist.add(media, member);
        this.messages.post({ author: { username: "" } as any, content: `${member.username} added [${media.title}] to playlist`, isSystemMessage: true });
    }

    /**
     * Removes an item from playlist. Only channel owner, mod, superadmin or member who added it can remove media
     * @param member 
     * @param url 
     * @returns void
     */
    removeMediaFromPlaylist(member: Member, url: string) {
        const target = this.currentPlaylist.selectFromQueue(url);
        if (!target) {
            return;
        }

        const isOwner = this.owner.id === member.id;
        const isSubmitterOfVideo = target.addedBy.id === member.id;
        const isSuperAdmin = member.isAdmin;
        const hasRightsToRemove = isOwner || isSuperAdmin || isSubmitterOfVideo;

        if (!hasRightsToRemove) {
            throw new ForbiddenException("Removing a playlist item is only allowed for channel owner, mods or member who submitted it.");
        }
        if (this.currentPlaylist.nowPlaying()?.media?.url === target.media.url) {
            throw new ForbiddenException("Removing a playlist item is only allowed when its is not currently playing");
        }

        this.currentPlaylist.remove(target.media);
        this.messages.post({ author: { username: "" } as any, content: `${member.username} removed ${target.media.title} from playlist`, isSystemMessage: true });
    }

    moveMediaPositionInPlaylist(member: Member, mediaUrl: string, newPosition: number) {
        this.throwIfNotPermitted(member, ROOM_ACTION_PERMISSIONS.reorderPlaylist);

        this.currentPlaylist.movePositionInListByMedia(mediaUrl, newPosition);
        const target = this.currentPlaylist.selectFromQueue(mediaUrl);
        this.messages.post({ author: { username: "" } as any, content: `${member.username} moved ${target.media.title} to position ${newPosition}`, isSystemMessage: true });
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

        if (this.voterIds.some(id => id === member.id)) {
            return;
        }

        this.voterIds.push(member.id);
        this.voteSkipCount = this.voteSkipCount + 1;

        // console.log(this.voteSkipCount);
        // console.log(this.voterIds);
        // console.log(this.minRequiredPercentageOfVoteSkippers);
        // console.log(this.maxVoteSkipCount);

        // // Note: playNext() is handled on leader client side
        // // not sure if there's a  way to even move it serverside for community channels
    }

    updateVoteSkipRatio(member: Member, newRatio: number) {
        this.throwIfNotPermitted(member, ROOM_ACTION_PERMISSIONS.editPlaylistSettings);

        if (newRatio < 0 || newRatio > 1) {
            throw new Error("Invalid ratio");
        }

        this.minRequiredPercentageOfVoteSkippers = newRatio;
    }

    addMessage(member: Member, content: string) {
        if (this.selectFromMembers(member)) {
            this.messages.post({ author: member, content, isSystemMessage: false })
        }
    }

    update(maxUsers: number, password?: string) {
        this.maxUsers = maxUsers;
        this.password = password;
    }

    clearPlaylist(member: Member) {
        this.throwIfNotPermitted(member, ROOM_ACTION_PERMISSIONS.modAndAbove);
        this.currentPlaylist.clear();
        this.messages.post({ isSystemMessage: true, content: `${member.username} cleared the playlist.`, author: { username: "" } as any })
    }

    private removeMemberSkipVote(member: Member) {
        if (this.voterIds.includes(member.id)) {
            this.voterIds = this.voterIds.filter(id => id != member.id);
        }
    }

    private filterOutMember(members: Member[], member: Member) {
        const index = members.findIndex(m => m.id === member.id);

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
        this.messages.post({ author: { username: "" } as any, content: `${member.username} is now leader`, isSystemMessage: true });
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

    private throwIfMaxConnectedMemberLimitReached() {
        if (this.members.length == this.maxUsers) {
            throw new Error(MessageTypes.REFUSE_JOIN_ROOM_FULL);
        }
    }
}
