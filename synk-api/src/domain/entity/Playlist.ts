import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn, JoinTable } from 'typeorm';
import { Channel } from './Channel';
import { Member } from './Member';
import { Video } from './Video';

@Entity()
export class Playlist {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: false })
  isLocked: boolean;

  @ManyToOne(() => Member, member => member.playlists, { nullable: true })
  createdBy: Member;

  @ManyToMany(() => Video, video => video.playlist, { onDelete: 'CASCADE' })
  @JoinTable()
  videos: Video[];

  @ManyToOne(() => Channel, channel => channel.playlists, { nullable: true })
  channel: Channel;
}
