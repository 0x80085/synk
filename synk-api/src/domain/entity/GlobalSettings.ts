import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class GlobalSettings {

  @PrimaryColumn()
  name: string;

  @Column()
  logoUrl: string;

  @Column()
  maxUsersInRoom: number;

  @Column()
  maxRooms: number;

  @Column()
  maxRoomsPerUser: number;

  @Column()
  allowedMediaHostingProviders: string;

  @Column()
  homepageAnnouncement: string;

  @Column()
  isRegistrationLocked: boolean;

  @Column()
  isChannelCreationLocked: boolean;

  @Column()
  currentTheme: string;

}
