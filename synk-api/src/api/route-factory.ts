import * as express from 'express';
import { Request, Response } from 'express-serve-static-core';
import { NextFunction } from 'connect';

import * as auth from '../auth/auth-service';

export interface RouteOptions {
  route: string;
  verb: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requireAuthentication: boolean;
  handlers: express.RequestHandler[];
}

export function setupRoute(
  app: express.Application,
  logger: any,
  opts: RouteOptions
) {

  const defaultHandlers = [];

  if (opts.requireAuthentication) {
    defaultHandlers.push((req: Request, res: Response, next: NextFunction) =>
      auth.ensureAuthenticated(req, res, next));
    // // (req: Request, res: Response, next: NextFunction, err: any)  => ErrorMiddleware
  }

  const routeProduct = [
    ...defaultHandlers,
    ...opts.handlers
  ].filter(i => Boolean(i));

  switch (opts.verb) {
    case 'GET':
      app.get(opts.route,
        ...routeProduct,
      );

      break;
    case 'POST':
      app.post(opts.route,
        ...routeProduct
      );

      break;
    case 'PUT':
      app.put(opts.route,
        ...routeProduct
      );

      break;
    case 'DELETE':
      app.delete(opts.route,
        ...routeProduct
      );

      break;
    case 'PATCH':
      app.patch(opts.route,
        ...routeProduct
      );

      break;


    default:
      app.get(opts.route,
        ...routeProduct
      );
      break;
  }
}


