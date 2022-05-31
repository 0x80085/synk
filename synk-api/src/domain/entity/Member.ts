import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Channel } from './Channel';
import { Playlist } from './Playlist';
import { Role } from './Role';
import { Video } from './Video';

@Entity()
export class Member {

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
  avatarUrl: string;

  @OneToMany(() => Playlist, playlist => playlist.createdBy, { nullable: true, onDelete: 'CASCADE' })
  playlists: Playlist[];

  @OneToMany(() => Video, video => video.addedBy, { nullable: true, onDelete: 'CASCADE' })
  videos: Video[];

  @OneToMany(() => Channel, channel => channel.owner, { nullable: true, onDelete: 'CASCADE' })
  channels: Channel[];

  @OneToMany(() => Role, role => role.member, { nullable: true, onDelete: 'CASCADE' })
  roles: Role[];

}
