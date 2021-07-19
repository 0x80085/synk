import { Member } from "../../../domain/entity";
import { Room } from "../room/room";

export interface MemberRepresentation {
    id: string;
    username: string;
    avatarUrl: string;
    isModerator: boolean;
    isOwner: boolean;
    isAdmin: boolean;
    isLeader: boolean;
}

export function getMemberSummary({ id, username, avatarUrl, isAdmin }: Member,room? :Room): MemberRepresentation {
    const isModerator = room ? room.moderators.findIndex(mod => mod.member.id === id) !== -1 : false;
    const isOwner = room ? room.owner.id === id : false;
    const isLeader = room ? room.leader && room.leader.id === id : false;

    return {
        id,
        username,
        avatarUrl,
        isModerator,
        isOwner,
        isAdmin,
        isLeader
    }
}