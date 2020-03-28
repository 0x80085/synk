import * as express from 'express';
import { Request, Response, NextFunction } from 'express-serve-static-core';

import * as auth from '../auth/middleware';
import { Logger } from '../tools/logger';

export interface RouteOptions {
  route: string;
  verb: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requireAuthentication: boolean;
  handlers: express.RequestHandler[];
}

export function setupRoute(
  app: express.Application,
  logger: Logger,
  opts: RouteOptions
) {
  const defaultHandlers = [];

  if (opts.requireAuthentication) {
    defaultHandlers.push((req: Request, res: Response, next: NextFunction) =>
      auth.ensureAuthenticated(req, res, next, logger));
  }

  const routeDefinition = [
    ...defaultHandlers,
    ...opts.handlers
  ].filter(i => Boolean(i));

  switch (opts.verb) {
    case 'GET':
      app.get(opts.route,
        ...routeDefinition,
      );

      break;
    case 'POST':
      app.post(opts.route,
        ...routeDefinition
      );

      break;
    case 'PUT':
      app.put(opts.route,
        ...routeDefinition
      );

      break;
    case 'DELETE':
      app.delete(opts.route,
        ...routeDefinition
      );

      break;
    case 'PATCH':
      app.patch(opts.route,
        ...routeDefinition
      );

      break;

    default:
      app.get(opts.route,
        ...routeDefinition
      );
      break;
  }
}


