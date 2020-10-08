import { SocketPassport } from '../models/socket.passport';


export function disconnectIfNotAuthenticated(socket: SocketPassport) {
  if (!socket.request.user
    || !socket.request.user.logged_in
    || !socket.client.request.isAuthenticated()
    || !socket.request.isAuthenticated()
  ) {
    console.log('disconnectIfNotLoggedIn', socket.request.user);
    console.log('disconnectIfNotLoggedIn', socket.request.isAuthenticated());
    socket.disconnect(true);
    throw new Error('authentication error');
  }
}


export function ThrowIfNotAuthenticated() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: [SocketPassport, ...any[]]) {
      try {
        const [socket] = args;
        disconnectIfNotAuthenticated(socket);
        originalMethod.apply(this, args);
      } catch (error) {
        console.log('user not logged in');
      }
    };
  };
}
