import * as socketio from "socket.io";
import * as http from "http";
import * as express from "express";
import { Request, Response } from "express-serve-static-core";

import * as dotenv from "dotenv";
import { RoomService } from "./room-service";
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

// Setup Socket.io listener for 'connection' event
io.on("connection", socket => {
  //   io.emit("this", { will: "be received by everyone" });

  // listen for room related events
  roomService.setupListeners(socket);
});

// Go
wsHttp.listen(3000, function() {
  console.log(`Started on port ${PORT}`);
});
