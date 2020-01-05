import { Column, Entity, ManyToMany, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Playlist } from './Playlist';
import { User } from './User';

@Entity()
export class Video {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column()
  positionInList: number;

  @Column()
  dateAdded: Date;

  @OneToMany(type => User, user => user.videos)
  addedBy: User;

  @ManyToMany(type => Playlist, playlist => playlist.videos)
  playlist: Playlist;

}
