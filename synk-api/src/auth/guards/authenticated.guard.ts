import { ExecutionContext, Injectable, CanActivate, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    return AuthenticatedGuard.validateSession(request);
  }

  static validateSession(request: any) {
    const now = new Date();
    const isLoggedIn  =  request.session.cookie.expires > now
      && !!request.session.passport
      && !!request.session.passport.user
      && !!request.session.passport.user.id;

      if (!isLoggedIn) {
        throw new UnauthorizedException();
      }

      return isLoggedIn;
  }
}