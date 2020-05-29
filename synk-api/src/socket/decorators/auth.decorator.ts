import { SocketPassport } from "../models/socket.passport";

export function RequiresAuthentication(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  let originalMethod = descriptor.value;
  descriptor.value = function (...args: [SocketPassport, ...any[]]) {
    try {
      const [socket] = args;
      console.log("wrapped function: before invoking " + propertyKey);
      console.log(args)
      throwIfNotLoggedIn(socket);
      let result = originalMethod.apply(this, args);
      console.log("wrapped function: after invoking " + propertyKey);

    } catch (error) {
      console.log("user not logged in");
    }
  }
}

export function throwIfNotLoggedIn(socket: SocketPassport) {
  if (
    !socket.request.user
    || !socket.request.user.logged_in
    || !socket.request.isAuthenticated()
  ) {
    throw "authentication error";
  }
}
