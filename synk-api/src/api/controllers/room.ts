import { Request, Response } from 'express';

import { Room } from '../../socket/models/room';
import { RoomService } from '../../socket/services/room-service';
import { Logger } from '../../tools/logger';
import * as channelHandler from '../handlers/channel';
import { PassportRequest } from './user';

export interface RoomDto {
  roomName: string;
  description: string;
  connectedUsers?: number;
  nowPlaying?: string;
}

/**
 * `GET /public-rooms`
 * Get all public chat rooms
 */
export const getRooms = async (
  req: Request,
  res: Response,
  roomService: RoomService
) => {
  const dtos = await channelHandler.getPublicChannels(roomService);
  res.json(dtos);
};

/**
 * `POST /create-room`
 * Creates a chat room
 */
export const createRoom = (
  req: PassportRequest,
  res: Response,
  roomService: RoomService,
  logger: Logger
) => {

  try {
    channelHandler.addChannel(req.user.username, req.body.name, req.body.description);
    roomService.createRoom(req.body);

    res.status(200).json('OK');
  } catch (error) {
    logger.error(error);

    res.status(500).json('ERROR - Room not created');
  }
};

function toDto(rooms: Room[]): RoomDto[] {
  return rooms.map(room => {
    return {
      roomName: room.name,
      description: room.description
    };
  });
}
