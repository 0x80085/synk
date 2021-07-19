import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ChannelConfig } from './ChannelConfig';
import { Member } from './Member';
import { Role } from './Role';

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

  @ManyToOne(type => Member, member => member.channels, { onDelete: 'CASCADE' })
  owner: Member;

  @OneToMany(type => ChannelConfig, config => config.channel, { onDelete: 'CASCADE' })
  configs: ChannelConfig[];

  @OneToMany(type => Role, role => role.channel, { onDelete: 'CASCADE' })
  roles: Role[];
}
