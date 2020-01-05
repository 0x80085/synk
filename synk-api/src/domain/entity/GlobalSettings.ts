import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class GlobalSettings {

  @PrimaryColumn()
  name: string;

  @Column({ default: null, nullable: true })
  logoUrl: string;

  @Column({ default: 108 })
  maxUsersInRoom: number;

  @Column({ default: 108 })
  maxRooms: number;

  @Column({ default: 5 })
  maxRoomsPerUser: number;

  @Column({ default: null, nullable: true })
  allowedMediaHostingProviders: string;

  @Column({ default: null, nullable: true })
  homepageAnnouncement: string;

  @Column({ default: false })
  isRegistrationLocked: boolean;

  @Column({ default: false })
  isChannelCreationLocked: boolean;

  @Column({ default: null, nullable: true })
  currentTheme: string;

}
