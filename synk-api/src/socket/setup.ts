import * as http from 'http';
import * as socketio from 'socket.io';
import * as passportSocketIo from 'passport.socketio';
import * as cookieParser from 'cookie-parser';

import { RoomService } from './services/room-service';
import { TypeormStore } from 'typeorm-store';
import { SocketPassport } from './models/socket.passport';

export interface MiddlewareConfig {
  genid: () => string;
  cookieParser: typeof cookieParser;
  secret: string;
  resave: boolean;
  saveUninitialized: boolean;
  store: TypeormStore;
  cookie: {
    maxAge: number;
  };
}

export function setupSockets(
  wsHttp: http.Server,
  sessionMiddleware: MiddlewareConfig
) {
  const io = socketio(wsHttp);
  const roomService = new RoomService(io);

  // Set up the Socket.IO server
  io.use((socket: SocketPassport, next) => {
    console.log('user trying to connect ', socket.id);
    console.log('user authed? ', socket.client.request.isAuthenticated());
    next();
  })
    .use(
      passportSocketIo.authorize({
        key: 'connect.sid', // make sure is the same as in your session settings in app.js
        secret: sessionMiddleware.secret, // make sure is the same as in your session settings in app.js
        store: sessionMiddleware.store, // you need to use the same sessionStore you defined in the app.use(session({... in app.js
        success: onAuthorizeSuccess, // *optional* callback on success
        fail: onAuthorizeFail // *optional* callback on fail/error
      })
    )
    .use(roomService.registerCommands)
    .on('connection', () => console.log('connected!'));

  return { roomService };
}

function onAuthorizeSuccess(
  socket: socketio.Socket,
  next: (err?: any) => void
) {
  console.log('successful connection to socket.io');
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
