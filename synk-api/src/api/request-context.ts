import * as express from 'express';
import { Request, Response } from 'express-serve-static-core';
import { NextFunction } from 'connect';

import * as auth from '../auth/auth-service';
import { RoomService } from '../socket/services/room-service';
import { Logger } from 'typeorm';

export interface RouteOptions {
  route: string;
  verb: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requireAuthentication: boolean;
  customAuth?: (req: Request, res: Response, next: NextFunction) => any;
  handlers: express.RequestHandler[];
}

export function setupRoute(
  app: express.Application,
  roomService: RoomService,
  logger: Logger,
  opts: RouteOptions
) {

  const defaultHandlers = [];

  if (opts.requireAuthentication) {
    defaultHandlers.push((req: Request, res: Response, next: NextFunction) =>
      auth.ensureAuthenticated(req, res, next));
  }

  app.get(opts.route,
    defaultHandlers,
    opts.customAuth,
    opts.handlers,
    (req: Request, res: Response, next: NextFunction) =>
      ExampleController(req, res, next, roomService, logger),
    // (req: Request, res: Response, next: NextFunction, err: any)  => ErrorMiddleware
  );

}

export const ExampleController = (
  req: Request, res: Response, next: NextFunction,
  roomService: RoomService, logger: Logger): any => {



  next();
}

// Example

setupRoute(express(), new RoomService({} as any), {} as any, {
  route: '/app-home',
  handlers: [],
  requireAuthentication: true,
  verb: 'GET'
});

