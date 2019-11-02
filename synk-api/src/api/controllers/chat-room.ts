import { Request, Response, NextFunction, RequestHandler } from "express";

import { RoomService } from "../../socket/room-service";
import { Room } from "../../socket/room";

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
  const dtos = convertToRoomsDto(rooms);

  res.send(dtos);
};

/**
 * `POST /create-room`
 * Creates a chat room
 */
export const createRoom = (
  req: Request,
  res: Response,
  roomService: RoomService
) => {
  console.log("##### ROOM CREATION TRY");

  try {
    roomService.createRoom(req.body);

    res.status(200).json("OK");
  } catch (error) {
    console.log(error);

    res.status(500).send("ERROR - Room not created");
  }
};

function convertToRoomsDto(rooms: Room[]): RoomDto[] {
  return rooms.map(room => {
    return {
      roomName: room.name,
      description: `${room.name}'s description here`
    };
  });
}
