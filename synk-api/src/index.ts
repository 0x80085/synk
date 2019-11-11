import * as http from "http";
import * as dotenv from "dotenv";
import * as express from "express";
import * as cors from "cors";

import "reflect-metadata";
import { createConnection } from "typeorm";

import setupAuthMiddleware from "./auth/auth-service";
import { setupRoutes } from "./api/routes";
import { setupSockets } from "./socket/setup";
import bodyParser = require("body-parser");

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

  const { sessionMiddleware } = await setupAuthMiddleware(app, connection);
  const { roomService } = setupSockets(app, wsHttp, sessionMiddleware);
  setupRoutes(app, roomService);

  return { app, wsHttp, connection, PORT };
}

async function run() {
  const { app, wsHttp, connection, PORT } = await configure();

  // Go
  wsHttp.listen(3000, function() {
    console.info(`###########################`);
    console.info(`\t SERVER LAUNCHED`);
    console.info(`###########################`);
    console.info(`\t Started on port ${PORT}`);
    console.info(`###########################`);
  });
}

run()
  .then()
  .catch(err => console.log(err))
  .finally();
