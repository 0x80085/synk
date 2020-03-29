import * as https from 'https';
import * as fs from 'graceful-fs';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as cors from 'cors';
import * as passport from 'passport';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as compression from 'compression';

import { Request, Response, NextFunction } from 'express-serve-static-core';

import 'reflect-metadata';
import { createConnection, Connection } from 'typeorm';
import { TypeormStore } from 'typeorm-store';

import setupAuthMiddleware, { SessionOptions } from './auth/middleware';
import { setupRouting } from './api/routes';
import { setupSockets } from './socket/setup';
import { Session } from './domain/entity/Session';
import { Logger } from './tools/logger';
import { errorMeow } from './api/error-handler';
import { configureSessionMiddleware } from './auth/config';

export default async function configure(logger: Logger) {
  dotenv.config();

  const port = +process.env.HOST_PORT;

  const corsUseCredentials = process.env.CORS_USE_CREDENTIAL === 'TRUE';
  const corsOrigin = process.env.CORS_ALLOWED_ORIGIN;

  const connection = await createConnection();

  const app = express();

  app.set('port', port);

  app.use(cors({ credentials: corsUseCredentials, origin: [corsOrigin, 'http://localhost'] }));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(compression());
  app.disable('x-powered-by');
  app.enable('trust proxy');

  app.use(morgan('short'));

  const credentials = getSSLCert();

  const wsHttps = https.createServer(credentials, app);

  const sessionMiddlewareConfig: SessionOptions = configureSessionMiddleware(connection);

  const { sessionMiddleware } = await setupAuthMiddleware(
    app,
    connection,
    sessionMiddlewareConfig,
    logger
  );

  const { roomService } = setupSockets(wsHttps, sessionMiddlewareConfig, logger);

  app.use(sessionMiddleware);

  app.use(passport.initialize());
  app.use(passport.session());

  setupRouting(app, roomService, logger);

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    errorMeow(err, res, logger);
  });

  return { wsHttps };
}

function getSSLCert() {
  try {
    const pathToKey = process.env.SSL_KEY_PATH;
    const pathToCert = process.env.SSL_CERT_PATH;

    if (!pathToKey || !pathToCert) {
      throw new Error('no path to SSL certificate found, will not be used');
    }

    const privateKey = fs.readFileSync(pathToKey, 'utf8');
    const certificate = fs.readFileSync(pathToCert, 'utf8');
    const credentials = { key: privateKey, cert: certificate };
    return credentials;

  } catch (e) {
    console.log(e);
    console.log('no cert found, resuming');
    return null;
  }
}
