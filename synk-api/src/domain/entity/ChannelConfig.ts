import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Channel } from './Channel';

@Entity()
export class ChannelConfig {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  isActivated: boolean;

  @Column()
  isPublic: boolean;

  @Column()
  logFileUrl: string;

  @Column()
  customValue: string;

  @Column()
  MOTD: string;

  @Column()
  bannerUrl: string;

  @Column()
  coverUrl: string;

  @Column()
  logoUrl: string;

  @Column()
  emojiListUrl: string;

  @Column()
  maxUsers: number;

  @ManyToOne(type => Channel, channel => channel.configs)
  channel: Channel;

}
