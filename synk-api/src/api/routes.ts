import * as express from "express";
import { Request, Response } from "express-serve-static-core";

import * as userController from "./controllers/user";
import * as chatroomController from "./controllers/chat-room";
import * as auth from "../auth/auth-service";
import { RoomService } from "../socket/services/room-service";

export function setupRoutes(
  app: express.Application,
  roomService: RoomService
) {
  /**
   * Account Routes
   */

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

  app.post("/login", userController.postLogin);
  app.get("/logout", userController.getLogout);
  app.post("/signup", userController.postSignup);

  app.delete(
    "/account/delete",
    auth.ensureAuthenticated,
    userController.deleteAccount
  );

  /**
   * Chat Room Routes
   */

  app.get("/public-rooms", (req: Request, res: Response) =>
    chatroomController.getRooms(req, res, roomService)
  );

  app.post(
    "/create-room",
    auth.ensureAuthenticated,
    (req: Request, res: Response) =>
      chatroomController.createRoom(req, res, roomService)
  );
}
