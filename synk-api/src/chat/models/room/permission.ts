import { Roles } from '../../../domain/entity';

export interface Permission {
    minimumRequiredRole: Roles;
    isLeaderFeature: boolean;
}
export const ROOM_ACTION_PERMISSIONS = {
    updateNowPlaying: { isLeaderFeature: true, minimumRequiredRole: Roles.member } as Permission,
    changeLeader: { isLeaderFeature: true, minimumRequiredRole: Roles.moderator } as Permission,
    
    editPlaylist: { isLeaderFeature: false, minimumRequiredRole: Roles.member } as Permission,
    editMods: { isLeaderFeature: false, minimumRequiredRole: Roles.admin } as Permission,
    editChannelSettings: { isLeaderFeature: false, minimumRequiredRole: Roles.admin } as Permission,
    editPlaylistSettings: { isLeaderFeature: false, minimumRequiredRole: Roles.admin } as Permission,
    
    banHammer: { isLeaderFeature: false, minimumRequiredRole: Roles.moderator } as Permission,
    
    adminAndAbove: { isLeaderFeature: false, minimumRequiredRole: Roles.admin } as Permission,
    modAndAbove: { isLeaderFeature: false, minimumRequiredRole: Roles.moderator } as Permission,
};
