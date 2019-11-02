import * as passport from "passport";
import * as passportLocal from "passport-local";

import { Request, Response, NextFunction } from "express";
import { User } from "../domain/entity/User";
import { createConnection, getConnection, FindConditions } from "typeorm";

const LocalStrategy = passportLocal.Strategy;

passport.serializeUser<User, string>((user: User, done) => {
  done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
  createConnection()
    .then(async connection => {
      console.log("Loading user from the database...", id);
      const user = await connection.manager.findOne(User, id);
      done(user);
    })
    .catch(error => done(error));
});

/**
 * Sign in using Email and Password.
 */
passport.use(
  new LocalStrategy(
    { usernameField: "username" },
    async (username, password, done) => {
      try {
        const connection = getConnection();
        var qry: FindConditions<User> = {
          username
        };
        const user = await connection.manager.findOneOrFail(User, {
          where: qry
        });
        if (user.passwordHash !== password) {
          return done(undefined, false, {
            message: "Invalid email or password."
          });
        }
        return done(undefined, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

/**
 * Login Required middleware.
 */
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.sendStatus(401);
};

/**
 * Authorization Required middleware.
 */
export const isAuthorized = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const provider = req.path.split("/").slice(-1)[0];

  const user = req.user as any;
  if (user.tokens.find(user.tokens, { kind: provider })) {
    next();
  } else {
    res.sendStatus(403);
  }
};
