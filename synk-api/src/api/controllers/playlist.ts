import { NextFunction, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { FindConditions, getConnection } from 'typeorm';

import { Playlist } from '../../domain/entity/Playlist';
import { User } from '../../domain/entity/User';
import { Video } from '../../domain/entity/Video';
import { PassportRequest } from './user';
import { Logger } from '../../tools/logger';
import * as playlistHandler from '../handlers/playlist';
import { RoomService } from '../../socket/services/room-service';

/**
 * GET /playlist/:playlistId
 * Gets a playlist by id.
 */
export const getPlaylistById = async (req: PassportRequest, res: Response) => {
  const connection = getConnection();

  const qry: FindConditions<Playlist> = {
    id: req.params.playlistId
  };
  const ls = await connection.manager.findOne(Playlist, { where: qry });

  if (!ls) {
    return res.status(404).json('Not found');
  }

  const lst = {
    name: ls.name,
    videos: ls.videos,
    id: ls.id
  };

  res.status(200).json(lst);
};

/**
 * GET /user/playlists
 * Returns playlists of current user
 */
export const getPlaylistsOfUser = async (req: PassportRequest, res: Response) => {
  const connection = getConnection();

  const qry: FindConditions<Playlist> = {
    name: req.user.username
  };
  const user = await connection.manager.findOne(User, { where: qry });

  if (!user) {
    return res.status(404).json('Not found');
  }

  const playlists = user.playlists.map(ls => ({ name: ls.name, videos: ls.videos }));

  res.status(200).json(playlists);
};

/**
 * `POST /create-playlist`
 * Create a playlist
 */
export const createPlaylist = async (
  req: PassportRequest,
  res: Response,
  next: NextFunction,
  logger: Logger
) => {

  try {

    check(req.body.playlistName, 'playlist name not valid').isLength({ min: 4 });

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(['error signup', errors]);
    }

    await playlistHandler.createPlaylist(req.user.username, req.body.playlistName);

    // await connection.manager.save(ls); ?

    res.status(200).json('OK');
  } catch (error) {
    logger.info(error);

    res.status(500).json('ERROR - playlist not created');
  }
};


/**
 * DELETE /playlist?id=xx
 * Delete a playlist w id.
 */
export const deletePlaylist = async (req: PassportRequest, res: Response) => {
  try {
    const connection = getConnection();

    const qry: FindConditions<Playlist> = {
      name: req.params.name
    };
    const ls = await connection.manager.findOne(Playlist, { where: qry });

    if (!ls) {
      return res.status(404).json('Not found');
    }

    await connection.manager.delete(Playlist, { where: qry });

    const lst = {
      name: ls.name,
      videos: ls.videos,
      id: ls.id
    };

    res.status(200).json(lst);
  } catch (error) {
    res.status(500).json(`Error`);
  }
};

/**
 * PUT /playlist/:playlistId/video
 * Add video to playlist (must be current user owned playlist)
 */
export const addVideoToList = async (req: PassportRequest, res: Response, roomService: RoomService) => {
  try {
    playlistHandler.addVideoToPlaylist(req.body.url, req.user.username, req.body.playlistId, req.body, roomService);

    res.status(200).json('OK');
  } catch (error) {
    res.status(404).json(error);
  }
};


