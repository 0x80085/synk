import * as passport from 'passport';
import { Express, Response, Request } from 'express'
import { User } from '../domain/entity/User'
import { Connection } from 'typeorm'

let LocalStrategy = require('passport-local').Strategy;

export default async function setupPassport(server: Express, connection: Connection) {
  const userRepo = connection.getRepository(User)

  passport.use('local', new LocalStrategy(
    async function (username: string, password: string, done: Function) {
      const searchUser = new User()
      const user = await userRepo.findOne({ username })

      searchUser.username = username

      if (!user) {
        done(null, false, { message: 'Could not find that user' })
      } else {
        const passwordIsCorrect = user.passwordash === password;

        if (passwordIsCorrect) {
          setTimeout(() => done(null, user), Math.floor(Math.random() * 20))
        } else {
          setTimeout(() => done(null, false, { message: 'Incorrect password' }), Math.floor(Math.random() * 20))
        }
      }
    }));

  passport.serializeUser(function (user: User, done: Function) {
    done(null, user.id);
  });

  passport.deserializeUser(async function (id: number, done) {
    const user = await userRepo.findByIds([id])
    if (user[0]) {
      done(null, user[0])
    } else {
      done("404", user[0])
    }
  });

  server.use(passport.initialize())
  server.use(passport.session())

  return server
}

export function ensureAuthenticated(req: Request, res: Response, next: Function) {
  console.log(req.user)
  if (req.isAuthenticated()) {
    return next();
  }

  res.sendStatus(403);

}