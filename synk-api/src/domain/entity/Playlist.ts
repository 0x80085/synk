import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { Video } from './Video';

@Entity()
export class Playlist {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({default: false})
  isLocked: boolean;

  @ManyToOne(type => User, user => user.playlists)
  createdBy: User;

  @ManyToMany(type => Video, video => video.playlist)
  videos: Video[];

}
