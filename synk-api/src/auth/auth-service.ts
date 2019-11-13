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
  sessionMw: session.SessionOptions
) {
  const userRepo = connection.getRepository(User);

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
  const sessionMiddleware = session(sessionMw);


  // server.use(passport.initialize());
  // server.use(passport.session());

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
  console.log("autthing ! by:: ", socket ? "socket " : "req");

  if (!isAuthenticated) {
    if (socket) {
      console.log(socket.client.request.session);

      console.log("socket::", "not authorized");
      return next(new Error("authentication error"));
    } else {
      console.log("http::", "not authorized");
      return res.sendStatus(403);
    }
  }

  console.log("authenticatd ! by:: ", socket ? "socket " : "req");

  return next();
}
