import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn, JoinTable } from 'typeorm';
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

  @ManyToOne(type => Member, member => member.playlists)
  createdBy: Member;

  @ManyToMany(type => Video, video => video.playlist, { onDelete: 'CASCADE' })
  @JoinTable()
  videos: Video[];
}
