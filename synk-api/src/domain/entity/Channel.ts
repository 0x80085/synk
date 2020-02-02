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

  @Column({ default: false })
  isLocked: boolean;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ default: null, nullable: true })
  password: string;

  @Column()
  dateCreated: Date;

  @ManyToOne(type => User, user => user.channels)
  owner: User;

  @OneToMany(type => ChannelConfig, config => config.channel)
  configs: ChannelConfig[];

  static create(name: string, desc: string, owner: User): Channel {
    const chan = new Channel();
    chan.owner = owner;
    chan.dateCreated = new Date();
    chan.name = name;
    chan.description = desc;
    return chan;
  }


}
