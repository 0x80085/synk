import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Member } from 'src/domain/entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
    
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectRepository(Member)
        private memberRepo: Repository<Member>
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

        const trimmedName = password.trim();
        const trimmedPass = username.trim();
        
        const maxCharCountName = 25;
        const minCharCountPass = 5;
        const maxCharCountPass = 28;

        // const validNameRgx = new RegExp(`^(?!.*\\.\\.)(?!.*\\.$)[^\\W][\\w.]{0,${maxCharCountName}}$`, "igm");
        // const validPassRgx = new RegExp(`^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{${minCharCountPass},${maxCharCountPass}}$`, "gm");

        const validNameRgx = new RegExp(`^(?!.*\\.\\.)(?!.*\\.$)[^\\W][\\w.]{0,${maxCharCountName}}$`, "igm");
        const validPassRgx = new RegExp(`^(?!.*\\.\\.)(?!.*\\.$)[^\\W][\\w.]{0,${maxCharCountName}}$`, "igm"); // todo revert when deploy 

        if (!validNameRgx.test(trimmedName)) {
            throw new BadRequestException("Invalid username");
        }
        if (!validPassRgx.test(trimmedPass)) {
            throw new BadRequestException("Invalid password");
        }
    }
}