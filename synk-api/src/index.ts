import * as socketio from "socket.io";
import * as http from "http";
import * as dotenv from "dotenv";
import * as express from "express";
import { Request, Response } from "express-serve-static-core";

import "reflect-metadata";
import { createConnection } from "typeorm";

import * as userController from "./api/controllers/user";
import { RoomService } from "./socket/room-service";
import setupPassport, * as auth from "./auth/auth-service";

export async function run() {
  dotenv.config();

  const PORT = process.env.HOST_PORT;

  // Init Db
  const connection = await createConnection();

  // Init express js
  const app = express();
  app.set("port", PORT);

  // setup PassportJS
  setupPassport(app, connection);

  // Bind SocketIO to Express server
  const wsHttp = new http.Server(app);
  const io = socketio(wsHttp);

  // Setup chat Rooms
  const roomService = new RoomService(io);

  io.use((socket, next) => {
    console.log("user connected", socket.id);

    roomService.setupListeners(socket);
    next();
  });

  // Setup api http server routes
  app.get("/", (req: Request, res: Response) => {
    res.send("herro from chink town");
  });
  app.get("/account", auth.ensureAuthenticated, userController.getAccount);
  app.patch(
    "/account/update",
    auth.ensureAuthenticated,
    userController.patchUpdateProfile
  );
  app.patch(
    "/account/password",
    auth.ensureAuthenticated,
    userController.patchUpdatePassword
  );
  app.delete(
    "/account/delete",
    auth.ensureAuthenticated,
    userController.deleteAccount
  );
  app.post("/login", userController.postLogin);
  app.get("/logout", userController.getLogout);
  app.post("/signup", userController.postSignup);

  // Go
  wsHttp.listen(3000, function() {
    console.info(`###########################`);
    console.info(`SERVER LAUNCHED`);
    console.info(`###########################`);
    console.info(`Started on port ${PORT}`);
    console.info(`###########################`);
  });
}

run()
  .then()
  .catch(err => console.log(err))
  .finally();
