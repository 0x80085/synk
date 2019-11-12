import * as http from "http";
import * as dotenv from "dotenv";
import * as express from "express";
import * as cors from "cors";

import "reflect-metadata";
import { createConnection } from "typeorm";

import setupAuthMiddleware from "./auth/auth-service";
import { setupRoutes } from "./api/routes";
import { setupSockets } from "./socket/setup";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import { TypeormStore } from "typeorm-store";
import { Session } from "./domain/entity/Session";
import uuid = require("uuid");
import passport = require("passport");

async function configure() {
  dotenv.config();

  const PORT = process.env.HOST_PORT;

  // Init Db
  const connection = await createConnection();

  // Init express js
  const app = express();
  app.set("port", PORT);
  app.use(cors({ credentials: true, origin: "http://localhost:4200" }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  const wsHttp = new http.Server(app);

  const sessionRepo = connection.getRepository(Session);
  const sessionMiddlewareConfig = {
    genid: () => {
      return uuid(); // use UUIDs for session IDs
    },
    cookieParser: cookieParser,
    secret: "whatisthissecretidowntknow",
    resave: false,
    saveUninitialized: false,
    store: new TypeormStore({ repository: sessionRepo }),
    cookie: {
      maxAge: 3600000
    }
  };

  const { sessionMiddleware } = await setupAuthMiddleware(
    app,
    connection,
    sessionMiddlewareConfig
  );
  const { roomService } = setupSockets(wsHttp, sessionMiddleware);
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
  .catch(err => console.log(err))
  .finally();
