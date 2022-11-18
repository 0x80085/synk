import { Roles } from '../../../domain/entity';

export interface Permission {
    minimumRequiredRole: Roles;
    isLeaderFeature: boolean;
}
export const ROOM_ACTION_PERMISSIONS = {
    updateNowPlaying: { isLeaderFeature: true, minimumRequiredRole: Roles.member } as Permission,
    changeLeader: { isLeaderFeature: true, minimumRequiredRole: Roles.moderator } as Permission,
    
    addToPlaylist: { isLeaderFeature: false, minimumRequiredRole: Roles.member } as Permission,
    reorderPlaylist: { isLeaderFeature: true, minimumRequiredRole: Roles.moderator } as Permission,
    editMods: { isLeaderFeature: false, minimumRequiredRole: Roles.admin } as Permission,
    editChannelSettings: { isLeaderFeature: false, minimumRequiredRole: Roles.admin } as Permission,
    editPlaylistSettings: { isLeaderFeature: false, minimumRequiredRole: Roles.admin } as Permission,
    clearPlaylist: { isLeaderFeature: false, minimumRequiredRole: Roles.admin } as Permission,
};
