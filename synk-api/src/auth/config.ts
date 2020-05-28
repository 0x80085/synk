
import { Connection } from 'typeorm';
import { TypeormStore } from 'typeorm-store';
import { Session } from '../domain/entity/Session';
import { SessionOptions } from './middleware';
import { v4 as uuid } from 'uuid';
import * as cookieParser from 'cookie-parser';

export function configureSessionMiddleware(connection: Connection) {
  const sessionSecret = process.env.SESSION_SECRET;
  const saveUninitialized = process.env.SESSION_SAVEUNINITIALIZED === 'TRUE';
  const resave = process.env.SESSION_RESAVE === 'TRUE';
  const secure = process.env.SESSION_HTTPS === 'TRUE';
  const cookieMaxAge = +process.env.SESSION_COOKIE_MAXAGE;

  const sessionRepo = connection.getRepository(Session);
  const sessionStore = new TypeormStore({ repository: sessionRepo });
  // TODO : Read https://www.npmjs.com/package/express-session thoroughly to set most appropriate config
  const sessionMiddlewareConfig: SessionOptions = {
    genid: () => {
      return uuid(); // use UUIDs for session IDs
    },
    cookieParser,
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
  };
  return sessionMiddlewareConfig;
}
