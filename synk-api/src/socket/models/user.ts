export type PermissionLevels = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export enum Roles {
  Leader = "Leader",
  Mod = "Mod",
  Janitor = "Janitor",
  Regular = "Regular",
  Newbie = "Newbie"
}

export interface RoomUser {
  id: string;
  userName: string;
  role: Roles;
  permissionLevel: PermissionLevels;
}
