import * as passport from 'passport';
import * as bcrypt from 'bcrypt';
import * as socketio from 'socket.io';
import * as session from 'express-session';

import { Express, Response, Request } from 'express';
import { Connection } from 'typeorm';

import { User } from '../domain/entity/User';

import { Strategy as LocalStrategy, IVerifyOptions } from 'passport-local';
import { Logger } from '../tools/logger';
import { PassportUserData } from '../api/controllers/user';

export type SessionOptions = session.SessionOptions & { cookieParser: any };

type PassportDoneFn = (error: any, user?: any, options?: IVerifyOptions) => void;

export default async function setupAuthMiddleware(
  server: Express,
  connection: Connection,
  sessionMw: SessionOptions,
  logger: Logger
) {
  const userRepo = connection.getRepository(User);

  passport.use(
    'local',
    new LocalStrategy(
      {
        passReqToCallback: true,
        session: true
      },
      async (
        req: Request,
        username: string,
        password: string,
        done: PassportDoneFn
      ) => {
        try {
          const user = await userRepo.findOne({ username });

          if (!user) {
            return done(null, false, { message: 'Could not find that user' });
          } else {
            const isCorrectPassword = await bcrypt.compare(
              password,
              user.passwordHash
            );

            if (isCorrectPassword) {
              logger.info(`User [${username}] logged in`);
              setTimeout(() =>
                done(null, user),
                Math.floor(Math.random() * 20));
            } else {
              setTimeout(
                () => done({ statusCode: 404, message: 'Not found' }, null),
                Math.floor(Math.random() * 20)
              );
            }
          }
        } catch (error) {
          logger.error(`Login error passport LocalStrategy  ${error}`);
          return done({ message: 'Something went wrong' }, null);
        }

      })
  );

  passport.serializeUser((user: User, done: PassportDoneFn) => {
    try {
      done(null, { id: user.id, username: user.username, isAdmin: user.isAdmin } as PassportUserData);
    } catch (error) {
      logger.error(`serializeUser error: ${error}`);
      done({ message: 'Something went wrong' }, null);
    }
  });

  passport.deserializeUser(
    async ({ id }: { id: string; username: string }, done) => {
      try {
        const user = await userRepo.findOne({ where: { id } });
        if (user) {
          done(null, { id: user.id, username: user.username, isAdmin: user.isAdmin } as PassportUserData);
        } else {
          done({ message: 'Not found' }, null);
        }
      } catch (error) {
        logger.error(`deserializeUser error: ${error}`);
        done({ message: 'Something went wrong' }, null);
      }
    }
  );

  const sessionMiddleware = session(sessionMw);

  return { server, sessionMiddleware };
}

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: (err?: any) => void,
  logger: Logger,
  socket?: socketio.Socket,
) {

  try {
    const isAuthenticated = socket
      ? socket.client.request.isAuthenticated()
      : req.isAuthenticated();

    if (!isAuthenticated) {
      if (socket) {
        logger.error(`Socket not authentciated, ${socket.client.id}. Blocking access`);
        return next(new Error('authentication error'));
      } else {
        logger.error(`Http request not authentciated, ${req.ip}. Blocking access`);
        return res.sendStatus(403);
      }
    }
    next();
  } catch (error) {
    logger.error(`ensureAuthenticated error: ${error}`);
    logger.error(`error client info ${socket ? socket.client.id : req.ip}`);
    if (socket && socket.request.user && socket.request.user.username) {
      logger.error(`error client info [${socket.request.user.username}] failed to authenticate`);
    }
    return next(new Error('authentication error'));
  }

}
