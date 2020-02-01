import { Request, Response } from 'express';

import { Room } from '../../socket/models/room';
import { RoomService } from '../../socket/services/room-service';
import { Logger } from '../../tools/logger';

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
export const getRooms = (
  req: Request,
  res: Response,
  roomService: RoomService
) => {
  const rooms = roomService.publicRooms;
  const dtos = toDto(rooms);

  res.json(dtos);
};

/**
 * `POST /create-room`
 * Creates a chat room
 */
export const createRoom = (
  req: Request,
  res: Response,
  roomService: RoomService,
  logger: Logger
) => {

  try {
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
