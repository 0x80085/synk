import * as passport from "passport";
import * as passportLocal from "passport-local";

import { Request, Response, NextFunction } from "express";
import { User } from "../domain/entity/User";
import { createConnection } from "typeorm";

const LocalStrategy = passportLocal.Strategy;

passport.serializeUser<User, string>((user: User, done) => {
    done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
    // User.findById(id, (err, user) => {
    //     done(err, user);
    // });


    createConnection().then(async connection => {

        // console.log("Inserting a new user into the database...");
        // const user = new User();
        // user.email = "Timber";
        // user.username = "Saw";
        // user.id = uuid();
        // user.passwordash = 'root';

        // await connection.manager.save(user);
        // console.log("Saved a new user with id: " + user.id);

        console.log("Loading user from the database...", id);
        const user = await connection.manager.findOne(User, id);
        done(user)

    }).catch(error => done(error));
});


/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: "email" }, (email, password, done) => {



    // User.findOne({ email: email.toLowerCase() }, (err, user: any) => {
    //     if (err) { return done(err); }
    //     if (!user) {
    //         return done(undefined, false, { message: `Email ${email} not found.` });
    //     }
    //     user.comparePassword(password, (err: Error, isMatch: boolean) => {
    //         if (err) { return done(err); }
    //         if (isMatch) {
    //             return done(undefined, user);
    //         }
    //         return done(undefined, false, { message: "Invalid email or password." });
    //     });
    // });
}));


/**
 * Login Required middleware.
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

/**
 * Authorization Required middleware.
 */
export const isAuthorized = (req: Request, res: Response, next: NextFunction) => {
    const provider = req.path.split("/").slice(-1)[0];

    const user = req.user as any;
    if (user.tokens.find(user.tokens, { kind: provider })) {
        next();
    } else {
        res.redirect(`/auth/${provider}`);
    }
};