import * as express from 'express';
import { Request, Response } from 'express-serve-static-core';

import * as userController from './controllers/user';
import * as chatroomController from './controllers/chat-room';
import * as playlistController from './controllers/playlist';
import * as auth from '../auth/auth-service';
import { RoomService } from '../socket/services/room-service';
import { NextFunction } from 'connect';

export function setupRoutes(
  app: express.Application,
  roomService: RoomService
) {
  /**
   * Account Routes
   */

  app.get('/', (req: Request, res: Response) => {
    res.send('herro from chink town');
  });
  app.get('/account',
    (req: Request, res: Response, next: NextFunction) =>
      auth.ensureAuthenticated(req, res, next),
    userController.getAccount);

  app.patch(
    '/account/update',
    (req: Request, res: Response, next: NextFunction) =>
      auth.ensureAuthenticated(req, res, next),
    userController.patchUpdateProfile
  );
  app.patch(
    '/account/password',
    (req: Request, res: Response, next: NextFunction) =>
      auth.ensureAuthenticated(req, res, next),
    userController.patchUpdatePassword
  );

  app.post('/login', userController.postLogin);
  app.get('/logout', userController.getLogout);
  app.post('/signup', userController.postSignup);

  app.delete(
    '/account/delete',
    (req: Request, res: Response, next: NextFunction) =>
      auth.ensureAuthenticated(req, res, next),
    userController.deleteAccount
  );

  /**
   * Chat Room Routes
   */

  app.get('/public-rooms', (req: Request, res: Response) =>
    chatroomController.getRooms(req, res, roomService)
  );

  app.post(
    '/create-room',
    (req: Request, res: Response, next: NextFunction) =>
      auth.ensureAuthenticated(req, res, next),
    (req: Request, res: Response) =>
      chatroomController.createRoom(req, res, roomService)
  );

  /**
   * Playlist Routes
   */

  /**
   * GET /playlist/:playlistId
   * Gets a playlist by id.
   */
  app.get(
    '/playlist/:playlistId',
    (req: Request, res: Response, next: NextFunction) =>
      auth.ensureAuthenticated(req, res, next),
    playlistController.getPlaylistById
  );


  /**
   * GET /user/playlists
   * Returns playlists of current user
   */
  app.get(
    '/user/playlists',
    (req: Request, res: Response, next: NextFunction) =>
      auth.ensureAuthenticated(req, res, next),
    playlistController.getPlaylistsOfUser
  );

  /**
   * `POST /playlist/:name`
   * Create a playlist
   */
  app.post(
    '/playlist/:name',
    (req: Request, res: Response, next: NextFunction) =>
      auth.ensureAuthenticated(req, res, next),
    playlistController.createPlaylist
  );
  /**
   * DELETE /playlist/:playlistId
   * Delete a playlist w id.
   */
  app.delete(
    '/playlist/:playlistId',
    (req: Request, res: Response, next: NextFunction) =>
      auth.ensureAuthenticated(req, res, next),
    playlistController.deletePlaylist
  );
  /**
   * PUT /playlist/:playlistId/video
   * Add video to playlist (must be curernt user owned playlist)
   */
  app.put(
    '/playlist/:playlistId',
    (req: Request, res: Response, next: NextFunction) =>
      auth.ensureAuthenticated(req, res, next),
    playlistController.addVideoToList
  );

}
