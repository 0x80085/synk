import { RoomCommands } from './room.models';
import { MediaCommands } from './media.models';

export enum SocketCommands {
  DISCONNECT = 'disconnect'
}

export type PossibleCommands = RoomCommands | SocketCommands | MediaCommands;
