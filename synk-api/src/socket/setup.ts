import * as http from "http";
import * as express from "express";
import * as socketio from "socket.io";

import { RoomService } from "./services/room-service";

export function setupSockets(app: express.Application, wsHttp: http.Server) {
  // Bind SocketIO to Express server
  const io = socketio(wsHttp);

  // Setup chat Rooms
  const roomService = new RoomService(io);

  io.use((socket, next) => {
    console.log("user connected", socket.id);

    roomService.setupListeners(socket);

    next();
  });

  return { roomService };
}