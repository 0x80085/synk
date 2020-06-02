import { SocketPassport } from '../models/socket.passport';

export function RequiresAuthentication(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: [SocketPassport, ...any[]]) {
    try {
      const [socket] = args;
      throwIfNotLoggedIn(socket);
      const result = originalMethod.apply(this, args);

    } catch (error) {
      console.log('user not logged in');
    }
  };
}

export function throwIfNotLoggedIn(socket: SocketPassport) {
  if (
    !socket.request.user
    || !socket.request.user.logged_in
    || !socket.request.isAuthenticated()
  ) {
    throw new Error('authentication error');
  }
}
