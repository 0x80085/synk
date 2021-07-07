import { RoomCommands } from './room.models';
import { MediaCommands } from './media.models';

export enum SocketCommands {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  EXCEPTION = 'exception',
  RECONNECT = 'reconnect',
  RECONNECT_ATTEMPT = 'reconnect_attempt',
  RECONNECT_ERROR = 'reconnect_error',
  RECONNECT_FAILED = 'reconnect_failed',
  CONNECT_TIMEOUT = 'connect_timeout',
  ERROR = 'error',

}

export type PossibleCommands = RoomCommands | SocketCommands | MediaCommands;
