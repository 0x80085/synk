import { SocketPassport } from '../models/socket.passport';

export function reg(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  console.log('RequiresAuthentication');

  const originalMethod = descriptor.value;
  descriptor.value = function (...args: [SocketPassport, ...any[]]) {
    try {
      const [socket] = args;
      disconnectIfNotLoggedIn(socket);
      const result = originalMethod.apply(this, args);

    } catch (error) {
      console.log('user not logged in');
    }
  };
}

export function disconnectIfNotLoggedIn(socket: SocketPassport) {
  if (!socket.request.user
    || !socket.request.user.logged_in
    || !socket.request.isAuthenticated()
  ) {
    console.log('disconnectIfNotLoggedIn', socket.request.user);
    console.log('disconnectIfNotLoggedIn', socket.request.isAuthenticated());
    socket.disconnect();
    throw new Error('authentication error');
  }
}

export function RequiresAuthentication() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: [SocketPassport, ...any[]]) {
      try {
        const [socket] = args;
        disconnectIfNotLoggedIn(socket);
        const result = originalMethod.apply(this, args);

      } catch (error) {
        console.log('user not logged in');
      }
    };
  };
}