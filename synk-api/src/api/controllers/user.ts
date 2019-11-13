import * as passport from "passport";

import { Request, Response, NextFunction, RequestHandler } from "express";
import { IVerifyOptions } from "passport-local";
import { check, sanitize, validationResult } from "express-validator";

import { User } from "../../domain/entity/User";
import uuid = require("uuid");
import { createConnection, FindConditions, getConnection } from "typeorm";
import * as bcrypt from "bcrypt";

/**
 * POST /login
 * Sign in using email and password.
 */
export const postLogin: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  check("username", "Email is not valid").isEmail();
  check("password", "Password cannot be blank").isLength({ min: 1 });

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).send(["login failed", errors]);
    // next();
  }

  passport.authenticate(
    "local",
    (err: Error, user: User, info: IVerifyOptions) => {
      if (err) {
        return res.status(500).send(["fatal err", err]);
      }
      if (!user) {
        return res.status(404).send("No user with those creds found");
      }
      req.logIn(user, err => {
        if (err) {
          console.log(err);
          return next(err);
        }
        req.login(user, error => {
          if (!error) {
            return res.status(200).send(["ok", "user logged in"]);
          }
          console.log(error);
          return next(err);
        });
        // next(user);
      });
    }
  )(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
export const getLogout = (req: Request, res: Response) => {
  req.logOut();
  req.logout();
  res.status(200).send("user logged out");
};

/**
 * POST /signup
 * Create a new local account.
 */
export const postSignup: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  check(req.body.username, "username not valid").isLength({ min: 4 });
  check(
    req.body.password,
    "Password must be at least 4 characters long"
  ).isLength({ min: 4 });

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(500).send(["error signup", errors]);
  }

  const connection = getConnection();

  var qry: FindConditions<User> = {
    username: req.body.username
  };
  const users = await connection.manager.find(User, { where: qry });

  if (users.length > 0) {
    return res.status(400).send(["error", "user already exists"]);
  }

  console.log("Inserting a new user into the database...");

  const hash = await bcrypt.hash(req.body.password, 10);

  const newRecord = new User();
  newRecord.id = uuid();
  newRecord.username = req.body.username;
  newRecord.passwordHash = hash;

  await connection.manager.save(newRecord);
  console.log("Saved a new user with id: " + newRecord.id);

  return res.status(200).send(["ok", "user added. try logging in"]);
};

/**
 * GET /account
 * Profile page.
 */
export const getAccount = (req: Request, res: Response) => {
  res.render("account/profile", {
    title: "Account Management"
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
export const patchUpdateProfile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  check("email", "Please enter a valid email address.").isEmail();
  // eslint-disable-next-line @typescript-eslint/camelcase
  sanitize("email").normalizeEmail({ gmail_remove_dots: false });

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).send(["error", errors]);
  }

  const user = req.user as User;
  // User.findById(user.id, (err, user: UserDocument) => {
  //     if (err) { return next(err); }
  //     user.email = req.body.email || "";
  //     user.profile.name = req.body.name || "";
  //     user.profile.gender = req.body.gender || "";
  //     user.profile.location = req.body.location || "";
  //     user.profile.website = req.body.website || "";
  //     user.save((err: WriteError) => {
  //         if (err) {
  //             if (err.code === 11000) {
  //                 req.flash("errors", { msg: "The email address you have entered is already associated with an account." });
  //                 return res.redirect("/account");
  //             }
  //             return next(err);
  //         }
  //         req.flash("success", { msg: "Profile information has been updated." });
  //         res.redirect("/account");
  //     });
  // });
};

/**
 * POST /account/password
 * Update current password.
 */
export const patchUpdatePassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  check("password", "Password must be at least 4 characters long").isLength({
    min: 4
  });
  check("confirmPassword", "Passwords do not match").equals(req.body.password);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).send(["error", errors]);
  }

  // const user = req.user as UserDocument;
  // User.findById(user.id, (err, user: UserDocument) => {
  //     if (err) { return next(err); }
  //     user.password = req.body.password;
  //     user.save((err: WriteError) => {
  //         if (err) { return next(err); }
  //         req.flash("success", { msg: "Password has been changed." });
  //         res.redirect("/account");
  //     });
  // });
};

/**
 * POST /account/delete
 * Delete user account.
 */
export const deleteAccount = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as User;
  // User.remove({ _id: user.id }, (err) => {
  //     if (err) { return next(err); }
  //     req.logout();
  //     req.flash("info", { msg: "Your account has been deleted." });
  //     res.redirect("/");
  // });
};
