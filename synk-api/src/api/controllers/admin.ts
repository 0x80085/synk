import { Response } from 'express';
import { getConnection } from 'typeorm';

import { PassportRequest } from './user';
import { Logger } from '../../tools/logger';
import { RoomService } from '../../socket/services/room-service';
import { RoomMember } from '../../socket/models/user';
import { Channel } from '../../domain/entity/Channel';
import { User } from '../../domain/entity/User';

import * as channelHandler from '../handlers/channel/';

export interface RoomDto {
  id: string;
  name: string;
  members: RoomMember[];
  creator: string;
}

export enum AdminPermissionError {
  NOT_ADMIN = 'NOT_ADMIN'
}

export function throw403If(condition: boolean, res: Response) {
  if (condition) {
    res.status(403).json(AdminPermissionError.NOT_ADMIN);
    throw new Error(AdminPermissionError.NOT_ADMIN);
  }
}

/**
 * `GET /admin/channels`
 * Get all channels and rooms
 */
export const getRoomsAndChannels = async (
  req: PassportRequest,
  res: Response,
  roomService: RoomService
) => {

  throw403If(!req.user.isAdmin, res);

  const connection = getConnection();

  const rooms: RoomDto[] =
    roomService.publicRooms.map(({ id, name, members, creator }) =>
      ({ id, name, members, creator }));
  const channels =
    await connection.manager.find(Channel, { relations: ['owner'] })
      .then(chanels => chanels.map(({ id, name, dateCreated, isLocked, isPublic, description, owner: { id: userId, isAdmin, username } }) =>
        ({ id, name, dateCreated, isLocked, isPublic, description, owner: { id: userId, isAdmin, username } })));
  const publicChannels =
    await channelHandler.getPublicChannels(roomService);

  const data = {
    channels,
    rooms,
    publicChannels
  };

  res.json(data);
};

/**
 * `GET /admin/users`
 * Get all users from DB and socket
 */
export const getUsers = async (
  req: PassportRequest,
  res: Response,
  roomService: RoomService
) => {

  throw403If(!req.user.isAdmin, res);

  const connection = getConnection();

  const accounts =
    await connection.manager.find(User, { relations: ['channels'] })
      .then(users => users.map(({ id, channels, isAdmin, username, dateCreated, lastSeen }) =>
        ({ id, channels, isAdmin, username, dateCreated, lastSeen })));
  const usersActiveInAtLeastOneRoom = roomService.allMembersInRooms();
  const usersConnectedToSocketServer = roomService.allConnectedMembers();

  const data = {
    accounts,
    usersActiveInAtLeastOneRoom,
    usersConnectedToSocketServer
  };

  res.json(data);
};

/**
 * `DELETE /admin/channel/id`
 * Deletes a channel
 */
export const deleteChannelByAdmin = async (
  req: PassportRequest,
  res: Response,
  roomService: RoomService,
  logger: Logger
) => {

  throw403If(!req.user.isAdmin, res);

  const connection = getConnection();

  const channel = await connection.manager.findOneOrFail(Channel, {
    where: {
      id: req.params.id
    }
  });

  try {
    if (channel) {
      await connection.manager.delete(Channel, { id: channel.id });
      roomService.deleteRoom(channel.name, req.user.username, true);
      logger.info(`ADMIN [${req.user.username}] Deleted channel [${channel.name}]`);
    }
    res.status(200).json('OK');
  } catch (error) {
    res.status(500).json('ERROR - Room not deleted');
  }

};
