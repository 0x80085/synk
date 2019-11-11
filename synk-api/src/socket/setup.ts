import * as http from "http";
import * as express from "express";
import * as socketio from "socket.io";

import { RoomService } from "./services/room-service";
import { ensureAuthenticated } from "../auth/auth-service";

export function setupSockets(
  app: express.Application,
  wsHttp: http.Server,
  sessionMiddleware: Function
) {
  // Bind SocketIO to Express server
  const io = socketio(wsHttp);

  // Setup chat Rooms
  const roomService = new RoomService(io);

  io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
  });

  io.use((socket, next) => {
    // sessionMiddleware(socket.client.request, socket.client.request.res, next);

    console.log("user connecting to socket", socket.id);

    roomService.setupListeners(socket);
    return next();

    // if (ensureAuthenticated(socket.request, socket.request, next, socket)) {
    // roomService.setupListeners(socket);
    //   return next();
    // }

    // Not allowed
    // socket.disconnect();
  }).on("connection", socket => {
    var userId = socket.request.session.passport.user;
    console.log("Your User ID is", userId);
  });

  return { roomService };
}
