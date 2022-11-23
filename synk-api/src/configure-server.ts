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
import { DataSource } from 'typeorm';
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

  const sessionConfig = await configureSession();

  app.use(sessionConfig);
  app.useWebSocketAdapter(new SessionIOAdapter(app, sessionConfig));
  app.use(passport.initialize());
  app.use(passport.session());

  const port = +process.env.HOST_PORT;

  return { app, port };
}

async function configureSession() {

  // Setup express-session for Passport Local strategy 
  const sessionSecret = process.env.SESSION_SECRET;
  const saveUninitialized = process.env.SESSION_SAVEUNINITIALIZED === 'TRUE';
  const resave = process.env.SESSION_RESAVE === 'TRUE';
  const secure = process.env.SESSION_HTTPS === 'TRUE';
  const cookieMaxAge = +process.env.SESSION_COOKIE_MAXAGE;

  const dbConnection = new DataSource({
    type: process.env.TYPEORM_CONNECTION as any|| 'postgres',
    host: process.env.TYPEORM_HOST || 'localhost',
    port: +process.env.TYPEORM_PORT || 5432,
    username: process.env.TYPEORM_USERNAME || 'user',
    password: process.env.TYPEORM_PASSWORD || 'complexpassword',
    database: process.env.TYPEORM_DATABASE || 'synk',
    logging: process.env.TYPEORM_LOGGING == 'true',
    synchronize:false,
    entities: [
      Session],
  })

  await dbConnection.initialize()

  const sessionRepo = dbConnection.getRepository(Session);
  const sessionStore = new TypeormStore({ repository: sessionRepo });

  console.log('ok i guess - ######');
  console.log(!!sessionStore);
  

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
