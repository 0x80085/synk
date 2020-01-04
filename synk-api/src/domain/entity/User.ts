import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Channel } from './Channel';
import { Playlist } from './Playlist';
import { Video } from './Video';

@Entity()
export class User {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  passwordHash: string;

  @Column()
  username: string;

  @Column()
  dateCreated: Date;

  @Column()
  isAdmin: boolean;

  @Column()
  lastSeen: Date;

  @Column()
  avatarUrl: Date;

  @OneToMany(type => Playlist, playlist => playlist.createdBy)
  playlists: Playlist[];

  @OneToMany(type => Video, video => video.addedBy)
  videos: Video[];

  @OneToMany(type => Channel, channel => channel.owner)
  channels: Channel[];

}
