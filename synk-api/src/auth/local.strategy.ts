import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({ username: '', password: ''  });
        // super();
    }

    async validate(username: string, password: string) {
        return await this.authService.validateUser(username, password)
            .catch(() => { throw new UnauthorizedException() });
    }
} 