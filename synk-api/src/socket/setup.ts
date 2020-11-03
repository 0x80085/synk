import * as http from 'http';
import * as socketio from 'socket.io';
import * as passportSocketIo from 'passport.socketio';

import { RoomService } from './services/room-service';
import { SessionOptions } from '../auth/middleware';
import { Store } from 'express-session';
import { Logger } from '../tools/logger';
import { PassportSocketIoOptions } from 'passport.socketio';

export function setupSockets(
  wsHttp: http.Server,
  sessionMiddleware: SessionOptions,
  logger: Logger
) {
  const io = socketio(wsHttp, {
    /*
     * Set ping timeout to 2 minutes to avoid spurious reconnects
     * during transient network issues.  The default of 5 minutes
     * is too aggressive.
     *
     * https://github.com/calzoneman/sync/issues/780
     */
    pingTimeout: 120000,
    pingInterval: 5000,

    /*
     * Per `ws` docs: "Note that Node.js has a variety of issues with
     * high-performance compression, where increased concurrency,
     * especially on Linux, can lead to catastrophic memory
     * fragmentation and slow performance."
     *
     * CyTube's frames are ordinarily quite small, so there's not much
     * point in compressing them.
     */
    perMessageDeflate: false,
    httpCompression: false,

    /*
     * Default is 10MB.
     * Even 1MiB seems like a generous limit...
     */
    // tslint:disable-next-line: no-bitwise
    maxHttpBufferSize: 1 << 20
  });

  const roomService = new RoomService(io, logger);

  const socketPassportConfig: PassportSocketIoOptions = {
    key: 'connect.sid', // make sure is the same as in your session settings in app.js
    secret: sessionMiddleware.secret as string, // make sure is the same as in your session settings in app.js
    store: sessionMiddleware.store as Store, // you need to use the same sessionStore you defined in the app.use(session({... in app.js
    success: (socket: socketio.Socket, next: (err?: any) => void) => {
      return onAuthorizeSuccess(socket, next, logger);
    }, // *optional* callback on success
    fail:
      // (
      //   data: socketio.Socket,
      //   message: string,
      //   error: string,
      //   next: (err?: any) => void
      // )
      (data: any, message: string, critical: boolean, accept: (err?: any, accepted?: boolean) => void) => {
        return onAuthorizeFail(data, message, critical, accept, logger);
      },
  };

  // Set up the Socket.IO server
  io
    .use(passportSocketIo.authorize(socketPassportConfig))
    .use(roomService.registerCommands)
    .on('connection', (socket) =>
      roomService.addMemberSocket(socket));

  return { roomService };
}

function onAuthorizeSuccess(
  socket: socketio.Socket,
  next: (err?: any) => void,
  logger: Logger
) {
  logger.info('success connection to socket.io:');
  next();
}

function onAuthorizeFail(
  data: socketio.Socket,
  message: string,
  isCritical: boolean,
  accept: (err?: any, accepted?: boolean) => void,
  logger: Logger
) {
  logger.info(`failed connection to socket.io. Critical error? :: ${isCritical}`);
  logger.info(`ERR MSG: ${message}`);
  accept(null, false);
}
