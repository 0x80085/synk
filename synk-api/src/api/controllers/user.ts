import * as passport from "passport";

import { Request, Response, NextFunction, RequestHandler } from "express";
import { IVerifyOptions } from "passport-local";
import { check, sanitize, validationResult } from "express-validator";

import { User } from "../../domain/entity/User";
import uuid = require("uuid");
import { createConnection, FindConditions, getConnection } from "typeorm";


/**
 * POST /login
 * Sign in using email and password.
 */
export const postLogin: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    check("email", "Email is not valid").isEmail();
    check("password", "Password cannot be blank").isLength({ min: 1 });
    sanitize("email").normalizeEmail({ gmail_remove_dots: false });

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).send(["login failed", errors]);
        next();
    }

    passport.authenticate("local", (err: Error, user: User, info: IVerifyOptions) => {
        if (err) { return res.status(500).send(["fatal err", err]) }
        if (!user) {
            return res.status(404).send("No user with those creds found");
        }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            res.status(200).send("user logged in");
        });
    })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
export const getLogout = (req: Request, res: Response) => {
    req.logout();
    res.status(200).send("user logged out");
};


/**
 * POST /signup
 * Create a new local account.
 */
export const postSignup: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    check("email", "Email is not valid").isEmail();
    check("username", "username not valid").isLength({ min: 4 });
    check("password", "Password must be at least 4 characters long").isLength({ min: 4 });

    sanitize("email").normalizeEmail({ gmail_remove_dots: false });

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(500).send(["error signup", errors]);
    }

    const connection = getConnection()

    console.log("Loading users from the database...");
    var qry: FindConditions<User> = {
        email: req.body.email
    }
    const users = await connection.manager.find(User, { where: qry });
    console.log("Loaded users: ", users);

    if (users || users.length == 0) {
        return res.status(400).send(["error", "user alsready exists"])
    }

    console.log("Inserting a new user into the database...");

    const newRecord: User = {
        email: req.body.email,
        passwordash: req.body.password,
        username: req.body.email,
        id: uuid()
    };

    await connection.manager.save(newRecord);
    console.log("Saved a new user with id: " + newRecord.id);

    return res.status(200).send(["ok", "user added. try logging in"])

    // }).catch(error => res.status(500).send(["error", error]));



    // User.findOne({ email: req.body.email }, (err, existingUser) => {
    //     if (err) { return next(err); }
    //     if (existingUser) {
    //         req.flash("errors", { msg: "Account with that email address already exists." });
    //         return res.redirect("/signup");
    //     }
    //     user.save((err) => {
    //         if (err) { return next(err); }
    //         req.logIn(user, (err) => {
    //             if (err) {
    //                 return next(err);
    //             }
    //             res.redirect("/");
    //         });
    //     });
    // });
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
export const patchUpdateProfile = (req: Request, res: Response, next: NextFunction) => {
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
export const patchUpdatePassword = (req: Request, res: Response, next: NextFunction) => {
    check("password", "Password must be at least 4 characters long").isLength({ min: 4 });
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
export const deleteAccount = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User;
    // User.remove({ _id: user.id }, (err) => {
    //     if (err) { return next(err); }
    //     req.logout();
    //     req.flash("info", { msg: "Your account has been deleted." });
    //     res.redirect("/");
    // });
};
