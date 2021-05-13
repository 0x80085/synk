import { Roles } from '../../../domain/entity';

export interface Permission {
    minimumRequiredRole: Roles;
    isLeaderFeature: boolean;
}
export const ROOM_ACTION_PERMISSIONS = {
    editPlaylist: { isLeaderFeature: false, minimumRequiredRole: Roles.member } as Permission,
    changeLeader: { isLeaderFeature: true, minimumRequiredRole: Roles.moderator } as Permission,
    updateNowPlaying: { isLeaderFeature: true, minimumRequiredRole: null } as Permission,
    editMods: { isLeaderFeature: false, minimumRequiredRole: Roles.admin } as Permission,
    banHammer: { isLeaderFeature: false, minimumRequiredRole: Roles.moderator } as Permission,
};
