import * as passport from 'passport';
import * as bcrypt from 'bcrypt';
import * as socketio from 'socket.io';
import * as session from 'express-session';

import { Express, Response, Request } from 'express';
import { Connection } from 'typeorm';

import { User } from '../domain/entity/User';

import { Strategy as LocalStrategy } from 'passport-local';

export default async function setupAuthMiddleware(
  server: Express,
  connection: Connection,
  sessionMw: session.SessionOptions
) {
  const userRepo = connection.getRepository(User);

  passport.use(
    'local',
    new LocalStrategy(async function(
      username: string,
      password: string,
      done: Function
    ) {
      const user = await userRepo.findOne({ username });

      if (!user) {
        done(null, false, { message: 'Could not find that user' });
      } else {
        const passwordIsCorrect = await bcrypt.compare(
          password,
          user.passwordHash
        );

        if (passwordIsCorrect) {
          setTimeout(() => done(null, user), Math.floor(Math.random() * 20));
        } else {
          setTimeout(
            () => done(null, false, { message: 'Incorrect password' }),
            Math.floor(Math.random() * 20)
          );
        }
      }
    })
  );

  passport.serializeUser((user: User, done: Function) => {
    console.log('serializeUser', user);

    done(null, { id: user.id, username: user.username });
  });

  passport.deserializeUser(
    async ({ id }: { id: string; username: string }, done) => {
      const user = await userRepo.findOne({ where: { id } });
      if (user) {
        done(null, { id: user.id, username: user.username });
      } else {
        done('404', null);
      }
    }
  );

  const sessionMiddleware = session(sessionMw);

  return { server, sessionMiddleware };
}

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: Function,
  socket?: socketio.Socket
) {
  const isAuthenticated = socket
    ? socket.client.request.isAuthenticated()
    : req.isAuthenticated();
  console.log('autthing ! by:: ', socket ? 'socket ' : 'req');

  if (!isAuthenticated) {
    if (socket) {
      console.log(socket.client.request.session);

      console.log('socket::', 'not authorized');
      return next(new Error('authentication error'));
    } else {
      console.log('http::', 'not authorized');
      return res.sendStatus(403);
    }
  }

  console.log('authenticatd ! by:: ', socket ? 'socket ' : 'req');

  return next();
}
