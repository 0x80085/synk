import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Channel } from './Channel';

@Entity()
export class User {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  passwordHash: string;

  @Column()
  username: string;

  @OneToMany(type => Channel, channel => channel.owner)
  channels: Channel[];

}
