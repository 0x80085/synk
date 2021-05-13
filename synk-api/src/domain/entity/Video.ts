import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Playlist } from './Playlist';
import { Member } from './Member';

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

  @OneToMany(type => Member, member => member.videos)
  addedBy: Member;

  @ManyToMany(type => Playlist, playlist => playlist.videos)
  playlist: Playlist;
}
