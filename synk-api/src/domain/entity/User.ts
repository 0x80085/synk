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

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: null, nullable: true })
  lastSeen: Date;

  @Column({ default: null, nullable: true })
  avatarUrl: Date;

  @OneToMany(type => Playlist, playlist => playlist.createdBy, { nullable: true })
  playlists: Playlist[];

  @OneToMany(type => Video, video => video.addedBy, { nullable: true })
  videos: Video[];

  @OneToMany(type => Channel, channel => channel.owner, { nullable: true })
  channels: Channel[];

  static create(username: string, passwordHash: string, isAdmin: boolean) {
    const u = new User();
    u.username = username;
    u.passwordHash = passwordHash;
    u.dateCreated = new Date();
    u.isAdmin = isAdmin;
    return u;
  }

}
