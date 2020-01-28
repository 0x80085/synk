import * as express from 'express';
import { Request, Response } from 'express-serve-static-core';

import * as userController from './controllers/user';
import * as chatroomController from './controllers/chat-room';
import * as playlistController from './controllers/playlist';
import { RoomService } from '../socket/services/room-service';
import { RouteOptions, setupRoute } from './route-factory';
import { ErrorMeow } from './error-handler';

const isAliveHandler = (req: Request, res: Response) => {
  res.json('ฅ^•ﻌ•^ฅ');
};

const testErrorMeowHandler = (req: Request, res: Response) => {
  throw new ErrorMeow(500, 'GeneratedtestErrorMeowHandler');
};

const ALL_ROUTES = (roomService: RoomService): RouteOptions[] => [
  {
    route: '/',
    handlers: [isAliveHandler],
    requireAuthentication: false,
    verb: 'GET'
  },
  {
    route: '/account',
    handlers: [userController.getAccount],
    requireAuthentication: true,
    verb: 'GET'
  },
  {
    route: '/account/update',
    handlers: [userController.patchUpdateProfile],
    requireAuthentication: true,
    verb: 'PATCH'
  },
  {
    route: '/account/password',
    handlers: [userController.patchUpdatePassword],
    requireAuthentication: true,
    verb: 'PATCH'
  },
  {
    route: '/login',
    handlers: [userController.postLogin],
    requireAuthentication: false,
    verb: 'POST'
  },
  {
    route: '/signup',
    handlers: [userController.postSignup],
    requireAuthentication: false,
    verb: 'POST'
  },
  {
    route: '/logout',
    handlers: [userController.getLogout],
    requireAuthentication: false,
    verb: 'GET'
  },
  {
    route: '/account/delete',
    handlers: [userController.deleteAccount],
    requireAuthentication: true,
    verb: 'DELETE'
  },
  {
    route: '/create-room',
    handlers: [
      (req: Request, res: Response) =>
        chatroomController.createRoom(req, res, roomService)
    ],
    requireAuthentication: true,
    verb: 'POST'
  },
  {
    route: '/public-rooms',
    handlers: [
      (req: Request, res: Response) => chatroomController.getRooms(req, res, roomService)
    ],
    requireAuthentication: false,
    verb: 'GET'
  },
  {
    route: '/playlist/:playlistId',
    handlers: [playlistController.getPlaylistById],
    requireAuthentication: true,
    verb: 'GET'
  },
  {
    route: '/user/playlists',
    handlers: [playlistController.getPlaylistsOfUser],
    requireAuthentication: true,
    verb: 'GET'
  },
  {
    route: '/playlist/:name',
    handlers: [playlistController.createPlaylist],
    requireAuthentication: true,
    verb: 'POST'
  },
  {
    route: '/playlist/:playlistId',
    handlers: [playlistController.deletePlaylist],
    requireAuthentication: true,
    verb: 'DELETE'
  },
  {
    route: '/playlist/:playlistId',
    handlers: [playlistController.addVideoToList],
    requireAuthentication: true,
    verb: 'PUT'
  },
  {
    route: '/error',
    handlers: [testErrorMeowHandler],
    requireAuthentication: false,
    verb: 'GET'
  },
];

export const setupRouting = (
  app: express.Application,
  roomService: RoomService,
  logger: any
) => {

  const routes = ALL_ROUTES(roomService);

  routes.forEach(routeOpts => {
    setupRoute(app, logger, routeOpts);
  });

};


