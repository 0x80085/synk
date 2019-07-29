import * as socketio from "socket.io";
import * as http from "http";
import * as express from "express";
import { Request, Response } from "express-serve-static-core";

import * as dotenv from "dotenv";
import { RoomService } from "./room-service";
import { AuthService } from "./auth-service";
dotenv.config();

const PORT = process.env.HOST_PORT;

// Init express js
const app = express();
app.set("port", PORT);

// Bind Socket.io to http server
const wsHttp = new http.Server(app);
const io = socketio(wsHttp);

// Setup http server listener for path '/'
app.get("/", (req: Request, res: Response) => {
  res.send("herro from chink town");
});

const roomService = new RoomService(io);
const authService = new AuthService();

// Setup middleware (auth, flood detect, b& filter, etc)
io.use((socket, next) => {
  var handshakeData = socket.request;
  if (!authService.authorize()) {
    next(new Error("not authorized"));
  }

  roomService.setupListeners(socket);

  next();
});

// Setup Socket.io listener for 'connection' event &
// listen for room related events
// io.on("connection", socket => {});

// Go
wsHttp.listen(3000, function() {
  console.log(`Started on port ${PORT}`);
});
