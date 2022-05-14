import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Channel } from './Channel';
import { Member } from './Member';

export enum Roles {
    moderator = "moderator",
    admin = "admin",
    member = "member",
}

@Entity()
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    name: Roles;
  
    @Column()
    dateCreated: Date;
  
    @Column()
    level: number;

    @ManyToOne(type => Member, member => member.roles)
    member: Member;

    @ManyToOne(type => Channel, channel => channel.roles)
    channel: Channel;
}