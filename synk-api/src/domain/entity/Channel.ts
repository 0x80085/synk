import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Room } from "../../socket/models/room";

@Entity()
export class Channel {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  dateCreated: Date;

  @Column()
  visibility: string;

  @ManyToOne(type => User, user => user.channels)
  owner: User;

  /**
   * Chat Room of the channel
   */
  room: Room;
}
