import * as session from 'express-session';
import * as passport from 'passport';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express/interfaces/nest-express-application.interface';
import { v4 as uuid } from 'uuid';

import { AppModule } from './app.module';
import { getSSLCert } from './util/get-ssl-certs';
import { Logger } from './util/logger';
import { configureExpressServer } from './util/configure-express-server';
import { SessionIOAdapter } from './chat/SessionIOAdapter';
import { getConnection } from 'typeorm';
import { Session } from './domain/entity/Session';
import { TypeormStore } from 'typeorm-store';

export async function configureServer(logger: Logger) {
  const corsUseCredentials = process.env.CORS_USE_CREDENTIAL === 'TRUE';
  const corsOrigin = process.env.CORS_ALLOWED_ORIGIN;
  const credentials = getSSLCert(logger);

  const opts = credentials
    ? {
      cors: { credentials: corsUseCredentials, origin: [corsOrigin] },
      httpsOptions: { ...credentials },
    }
    : {
      cors: { credentials: corsUseCredentials, origin: [corsOrigin] },
    };

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    opts
  );

  configureExpressServer(app);

  const sessionConfig = configureSession();

  app.use(sessionConfig);
  app.useWebSocketAdapter(new SessionIOAdapter(app, sessionConfig));
  app.use(passport.initialize());
  app.use(passport.session());

  const port = +process.env.HOST_PORT;

  return { app, port };
}

function configureSession() {

  // Setup express-session for Passport Local strategy 
  const sessionSecret = process.env.SESSION_SECRET;
  const saveUninitialized = process.env.SESSION_SAVEUNINITIALIZED === 'TRUE';
  const resave = process.env.SESSION_RESAVE === 'TRUE';
  const secure = process.env.SESSION_HTTPS === 'TRUE';
  const cookieMaxAge = +process.env.SESSION_COOKIE_MAXAGE;

  const sessionRepo = getConnection().getRepository(Session);
  const sessionStore = new TypeormStore({ repository: sessionRepo });

  return session(
    {
      genid: () => {
        return uuid(); // use UUIDs for session IDs
      },
      secret: sessionSecret,
      resave,
      saveUninitialized,
      rolling: true,
      store: sessionStore,
      cookie: {
        httpOnly: true,
        secure,
        domain: process.env.DOMAIN_NAME,
        maxAge: cookieMaxAge,
        sameSite: true
      }
    });
}
