import { Request, Response } from 'express';

import { RoomService } from '../../socket/services/room-service';
import { Logger } from '../../tools/logger';
import * as channelHandler from '../handlers/channel/';
import { PassportRequest } from './user';

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
 * `GET /account/channels`
 * Get all channels owned by user
 */
export const getChannelsOwnedByUser = async (
  req: PassportRequest,
  res: Response,
  roomService: RoomService
) => {

  const channels =
    await channelHandler.getChannelsOwnedByUser(req.user.username);

  res.json(channels);
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
    channelHandler.createChannel(req.user.username, req.body.name, req.body.description);
    roomService.createRoom(req.body, req.user.username);
    logger.info(`${req.user.username} created channel ${req.body.name}`);

    res.status(200).json('OK');
  } catch (error) {
    logger.info(`${req.user.username} cfailed to create room ${req.body.name}`);
    logger.error(error);

    res.status(500).json('ERROR - Room not created');
  }
};

/**
 * `DELETE /account/channels/name`
 * Creates a chat room
 */
export const deleteRoom = (
  req: PassportRequest,
  res: Response,
  roomService: RoomService,
  logger: Logger
) => {

  try {
    channelHandler.deleteChannelOfUser(req.user.username, req.params.name);
    roomService.deleteRoom(req.params.name, req.user.username);
    logger.info(`${req.user.username} DELETED channel ${req.body.name}`);

    res.status(200).json('OK');
  } catch (error) {
    logger.info(`${req.user.username} FAILED TO DELETE channel ${req.body.name}`);
    logger.error(error);

    res.status(500).json('ERROR - Room not deleted');
  }
};
