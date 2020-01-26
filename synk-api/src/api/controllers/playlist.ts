import { NextFunction, RequestHandler, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { FindConditions, getConnection } from 'typeorm';

import { Playlist } from '../../domain/entity/Playlist';
import { User } from '../../domain/entity/User';
import { Video } from '../../domain/entity/Video';
import { PassportRequest } from './user';


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
    return res.status(404).send('Not found');
  }

  const lst = {
    name: ls.name,
    videos: ls.videos,
    id: ls.id
  };

  res.status(200).send(lst);
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
    return res.status(404).send('Not found');
  }

  const playlists = user.playlists.map(ls => ({ name: ls.name, videos: ls.videos }));

  res.status(200).send(playlists);
};

/**
 * `POST /create-playlist`
 * Create a playlist
 */
export const createPlaylist: RequestHandler = async (
  req: PassportRequest,
  res: Response,
  next: NextFunction
) => {

  try {

    check(req.body.playlistName, 'playlist name not valid').isLength({ min: 4 });

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).send(['error signup', errors]);
    }

    const connection = getConnection();

    const user = await connection.manager.findOneOrFail(User, {
      where: {
        username: req.body.username
      }
    });

    const ls = Playlist.create(req.body.playlistName);
    user.playlists.push(ls);

    ls.createdBy = user;

    await connection.manager.save(user);
    // await connection.manager.save(ls); ?

    res.status(200).send('OK');
  } catch (error) {
    console.log(error);

    res.status(500).send('ERROR - playlist not created');
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
      return res.status(404).send('Not found');
    }

    await connection.manager.delete(Playlist, { where: qry });

    const lst = {
      name: ls.name,
      videos: ls.videos,
      id: ls.id
    };

    res.status(200).send(lst);
  } catch (error) {
    res.status(500).send(`Error`);
  }
};



/**
 * PUT /playlist/:playlistId/video
 * Add video to playlist (must be curernt user owned playlist)
 */
export const addVideoToList = async (req: PassportRequest, res: Response) => {
  try {
    const connection = getConnection();

    const user = await connection.manager.findOneOrFail(User, {
      where: {
        username: req.body.username
      }
    });

    const ls = user.playlists.filter(p => p.id === req.params.playlistId)[0];

    if (!ls) {
      return res.status(404).send('Not found');
    }

    const vid: Video = Video.create(req.body.url);
    vid.addedBy = user;

    ls.videos.push(vid);

    await connection.manager.save(ls);

    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send(`Error`);
  }
};
