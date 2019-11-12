import * as http from "http";
import * as socketio from "socket.io";

import { RoomService } from "./services/room-service";
import * as e from "express";
import passport = require("passport");

export function setupSockets(
  wsHttp: http.Server,
  sessionMiddleware: e.RequestHandler
) {
  const io = socketio(wsHttp);
  const roomService = new RoomService(io);

  // Set up the Socket.IO server
  io.use(function(socket, next) {
    // Wrap the express middleware
    sessionMiddleware(socket.client.request, {} as any, next);
  })
    .use((socket, next) => {
      console.log("user trying to connect ", socket.id);
      console.log("user authed? ", socket.client.request.isAuthenticated());
      next();
    })
    .use((socket, next) => {
      try {
        console.log(socket.client.request.session);
        console.log(socket.request.session);
        console.log(socket.request.isAuthenticated);
        console.log(socket.client.request.isAuthenticated);
        console.log(socket.request.session.passport.user);
        console.log(socket.request.session.passport);

      } catch (error) {}

      if (socket.client.request.isAuthenticated()) {
        console.log("user authed", socket.id);
        roomService.setupListeners(socket);
        return next();
      }
      // Not allowed
      console.log("socket:: Not allowed");
      next(new Error("unauthorized"));
    })
    .on("connection", () => {
      console.log("connected!");
    });

  return { roomService };
}
