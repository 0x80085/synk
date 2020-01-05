import * as http from 'http';
import * as socketio from 'socket.io';
import * as passportSocketIo from 'passport.socketio';

import { RoomService } from './services/room-service';
import { SessionOptions } from '../auth/auth-service';
import { Store } from 'express-session';

export function setupSockets(
  wsHttp: http.Server,
  sessionMiddleware: SessionOptions
) {
  const io = socketio(wsHttp);

  const roomService = new RoomService(io);

  const socketPassportConfig = {
    key: 'connect.sid', // make sure is the same as in your session settings in app.js
    secret: sessionMiddleware.secret as string, // make sure is the same as in your session settings in app.js
    store: sessionMiddleware.store as Store, // you need to use the same sessionStore you defined in the app.use(session({... in app.js
    success: onAuthorizeSuccess, // *optional* callback on success
    fail: onAuthorizeFail // *optional* callback on fail/error
  };

  // Set up the Socket.IO server
  io
    .use(passportSocketIo.authorize(socketPassportConfig))
    .use(roomService.registerCommands)
    .on('connection', (socket) => console.log(`${socket.request.user.username} connected to socket server`));

  return { roomService };
}

function onAuthorizeSuccess(
  socket: socketio.Socket,
  next: (err?: any) => void
) {
  console.log('success connection to socket.io:');
  next();
}

function onAuthorizeFail(
  data: socketio.Socket,
  message: string,
  error: string,
  next: (err?: any) => void
) {
  console.log('failed connection to socket.io:', message);
  next(new Error(message));
}
