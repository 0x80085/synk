import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { SerializedUserData } from 'src/auth/local.serializer';

@Injectable()
export class AdminGuard implements CanActivate {
    async canActivate(context: ExecutionContext) {
        try {
            const request = context.switchToHttp().getRequest() as Express.Request;
            const member = request.user as SerializedUserData;
            AuthenticatedGuard.validateSession(request)
            return member.isAdmin;
        } catch (error) {
            return false
        }
    }
}