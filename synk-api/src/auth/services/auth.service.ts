import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Response, Request } from 'express';


import { Member } from 'src/domain/entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConnectionTrackingService } from 'src/chat/services/connection-tracking.service';

export const VALIDNAME_RGX = new RegExp(/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/);

export function isValidPassword(trimmedPass: string) {
    return trimmedPass.length >= 5 && trimmedPass.length <= 28;
}

@Injectable()
export class AuthService {
    
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectRepository(Member)
        private memberRepo: Repository<Member>,
        private tracker: ConnectionTrackingService
    ) { }

    async validateUser(username: string, password: string) {
        return await this.memberRepo.findOneOrFail({ where: { username } })
            .then(member => bcrypt.compare(password, member.passwordHash)
                .then(isCorrectPassword => {
                    if (!isCorrectPassword) {
                        throw new NotFoundException();
                    }
                    return member;
                }))
            .catch(err => {
                this.logger.log(err);
                this.logger.log('^^^ error occurred when trying to validate user');
                this.logger.log(`user: ${username}`);
                throw new NotFoundException();
            });
    }

    async createAccount(username: string, password: string) {
        this.throwIfInputInvalid(username, password);
        await this.throwIfUsernameTaken(username);

        const passwordHash = await bcrypt.hash(password, 10);

        const user = this.memberRepo.create({
            id: uuid(),
            dateCreated: new Date(),
            passwordHash,
            username
        });
        await this.memberRepo.save(user);
    }

   async logout(request: any, response: Response){
        const logoutError = await new Promise((resolve) =>
        request.logOut({ keepSessionInfo: false }, (error) =>
          resolve(error),
        ),
      );
        request.session = null
        response.clearCookie('io')
        response.clearCookie('connect.sid')
    }

    private async throwIfUsernameTaken(username: string) {
        const alreadyExists = await this.memberRepo.findOne({ where: { username } }).then(res => !!res);
        if (alreadyExists) {
            throw new ConflictException();
        }
    }

    private throwIfInputInvalid(username: string, password: string) {
        if (typeof password !== 'string' || typeof username !== 'string') {
            throw new BadRequestException();
        }

        const trimmedName = username.trim();
        const trimmedPass = password.trim();
    
        if (!VALIDNAME_RGX.test(trimmedName)) {
            throw new BadRequestException("Invalid username");
        }
        if (!isValidPassword(trimmedPass)) {
            throw new BadRequestException("Invalid password");
        }
    }

    disconnectSocketConnections(req: Request) {
        try {
            const reqIp = this.tracker.getIpFromRequest(req);
            const sockets = this.tracker.getSocketsByMemberIdAndIpAddress((req.user as any).id, reqIp);
            sockets.forEach(socket => socket.disconnect(true));
        } catch (error) {
            this.logger.warn(`Error when trying to disconnect sockets for logged out user`);
            this.logger.warn(error);
        }
    }
}