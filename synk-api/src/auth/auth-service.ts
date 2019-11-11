import * as passport from "passport";
import * as bcrypt from "bcrypt";
import * as uuid from "uuid";
import * as socketio from "socket.io";
import * as session from "express-session";

import { Express, Response, Request } from "express";
import { Connection } from "typeorm";
import { TypeormStore } from "typeorm-store";

import { User } from "../domain/entity/User";
import { Session } from "../domain/entity/Session";

import { Strategy as LocalStrategy } from "passport-local";

export default async function setupAuthMiddleware(
  server: Express,
  connection: Connection,
  io: socketio.Server
) {
  const userRepo = connection.getRepository(User);
  const sessionRepo = connection.getRepository(Session);

  passport.use(
    "local",
    new LocalStrategy(async function(
      username: string,
      password: string,
      done: Function
    ) {
      const user = await userRepo.findOne({ username });

      if (!user) {
        done(null, false, { message: "Could not find that user" });
      } else {
        const passwordIsCorrect = await bcrypt.compare(
          password,
          user.passwordHash
        );

        if (passwordIsCorrect) {
          setTimeout(() => done(null, user), Math.floor(Math.random() * 20));
        } else {
          setTimeout(
            () => done(null, false, { message: "Incorrect password" }),
            Math.floor(Math.random() * 20)
          );
        }
      }
    })
  );

  passport.serializeUser((user: User, done: Function) => {
    console.log("serializeUser", user);

    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    const user = await userRepo.findOne({ where: { id } });
    if (user) {
      console.log("deserializeUser", user);
      done(null, user);
    } else {
      done("404", user);
    }
  });

  // generate & configure session/passport middleware
  const sessionMiddleware = session({
    genid: req => {
      return uuid(); // use UUIDs for session IDs
    },
    secret: "whatisthissecretidowntknow",
    resave: false,
    saveUninitialized: false,
    store: new TypeormStore({ repository: sessionRepo }),
    cookie: {
      maxAge: 3600000
    }
  });
  server.use(sessionMiddleware);
  io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
  });

  server.use(passport.initialize());
  server.use(passport.session());

  return server;
}

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: Function
) {

  if (req.isAuthenticated()) {
    console.log("user", req.user);
    console.log("session", req.session);
    console.log(`user authenticated`);

    return next();
  }

  console.log(`user NOT! authenticated`);
  res.sendStatus(403);
}
