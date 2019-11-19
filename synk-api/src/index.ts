import * as http from "http";
import * as dotenv from "dotenv";
import * as express from "express";
import * as cors from "cors";
import * as uuid from "uuid";
import * as passport from "passport";

import "reflect-metadata";
import { createConnection } from "typeorm";

import setupAuthMiddleware from "./auth/auth-service";
import { setupRoutes } from "./api/routes";
import { setupSockets } from "./socket/setup";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import { TypeormStore } from "typeorm-store";
import { Session } from "./domain/entity/Session";

async function configure() {
  // Config
  dotenv.config();

  const port = +process.env.HOST_PORT;

  // CORS
  const corsUseCredentials = process.env.CORS_USE_CREDENTIAL === "TRUE";
  const corsOrigin = process.env.CORS_ALLOWED_ORIGIN;

  // Auth, sessions
  const sessionSecret = process.env.SESSION_SECRET;
  const saveUninitialized = process.env.SESSION_SAVEUNINITIALIZED === "TRUE";
  const resave = process.env.SESSION_RESAVE === "TRUE";
  const cookieMaxAge = +process.env.SESSION_COOKIE_MAXAGE;

  // Init Db
  const connection = await createConnection();

  // Init express js
  const app = express();
  app.set("port", port);
  app.use(cors({ credentials: corsUseCredentials, origin: corsOrigin }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  const wsHttp = new http.Server(app);

  const sessionRepo = connection.getRepository(Session);
  const sessionStore = new TypeormStore({ repository: sessionRepo });
  const sessionMiddlewareConfig = {
    genid: () => {
      return uuid(); // use UUIDs for session IDs
    },
    cookieParser: cookieParser,
    secret: sessionSecret,
    resave: resave,
    saveUninitialized: saveUninitialized,
    store: sessionStore,
    cookie: {
      maxAge: cookieMaxAge
    }
  };

  const { sessionMiddleware } = await setupAuthMiddleware(
    app,
    connection,
    sessionMiddlewareConfig
  );
  const { roomService } = setupSockets(wsHttp, sessionMiddlewareConfig);
  app.use(sessionMiddleware);

  app.use(passport.initialize());
  app.use(passport.session());

  setupRoutes(app, roomService);

  return { wsHttp };
}

async function run() {
  const { wsHttp } = await configure();

  // Go
  wsHttp.listen(3000, function() {
    console.info(`###########################`);
    console.info(`\t SERVER LAUNCHED`);
    console.info(`###########################`);
    console.info(`\t Started on port ${process.env.HOST_PORT}`);
    console.info(`###########################`);
  });
}

run()
  .then()
  .catch(err => {
    console.error(`\t#########><::> ###############><::> ###`);
    console.error(`\t SERVER CRASHED`);
    console.error(`\t><::> ###################><::> ########`);
    console.error(err);
  })
  .finally(() => {});
