import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from '../../socket/models/room';
import { ChannelConfig } from './ChannelConfig';
import { User } from './User';

@Entity()
export class Channel {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  isLocked: boolean;

  @Column()
  isPublic: boolean;

  @Column()
  password: string;

  @Column()
  dateCreated: Date;

  @ManyToOne(type => User, user => user.channels)
  owner: User;

  @OneToMany(type => ChannelConfig, config => config.channel)
  configs: ChannelConfig[];

  /**
   * Chat Room of the channel (socketio)
   */
  room: Room;
}
