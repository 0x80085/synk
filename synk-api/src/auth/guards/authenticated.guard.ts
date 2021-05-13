import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    return AuthenticatedGuard.validateSession(request);
  }

  static validateSession(request: any) {
    const now = new Date();
    return request.session.cookie.expires > now
      && !!request.session.passport
      && !!request.session.passport.user
      && !!request.session.passport.user.id;
  }
}