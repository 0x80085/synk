import { PlaylistRepresentation, toRepresentation } from "../playlist/playlist.representation";
import { getMemberSummary, MemberRepresentation } from "../member/member.representation";
import { Room } from "../room/room";
import { Channel } from "src/domain/entity";

export interface ChannelRepresentation {
    id: string;
    isPublic: boolean;
    name: string;
    description: string;
    members: MemberRepresentation[];
    leader: MemberRepresentation;
    moderators: MemberRepresentation[];
    owner: MemberRepresentation;
    playlists: PlaylistRepresentation[];
    currentPlaylist: PlaylistRepresentation;
}

export interface ChannelShortRepresentation {
    id: string;
    name: string;
    description: string;
    connectedMemberCount: number;
    nowPlaying: string;
    isPublic: boolean;
    dateCreated: Date;
    isLocked: boolean;
}

export function getChannelRepresentation(channel: Channel, room?: Room): ChannelRepresentation {
    return {
        name: channel.name,
        id: channel.id,
        description: channel.description,
        isPublic: channel.isPublic,
        leader: room.leader ? getMemberSummary(room.leader, room) : null,
        members: room.members.map(member => getMemberSummary(member, room)),
        moderators: room.moderators.map(({ member }) => getMemberSummary(member, room)),
        owner: getMemberSummary(channel.owner, room),
        currentPlaylist: room ? toRepresentation(room.currentPlaylist) : null,
        playlists: room?.playlists.map(ls => toRepresentation(ls))
    }
}

export const getChannelShortRepresentation = ({
    room: { currentPlaylist, members },
    channel: { id, description, name, isLocked, isPublic, dateCreated } }: { room: Room, channel: Channel }): ChannelShortRepresentation =>
({
    id,
    name,
    isPublic,
    dateCreated,
    isLocked,
    description,
    connectedMemberCount: members.length,
    nowPlaying: currentPlaylist.nowPlaying().media?.title
})

export function mergeChannelAndRoom({ channel, room }: { room: Room, channel: Channel }): ChannelRepresentation {
    const roomData = getChannelRepresentation(channel, room);
    return roomData;
}
