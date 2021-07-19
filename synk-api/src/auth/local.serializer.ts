import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../domain/entity';

export interface SerializedUserData {
    id: string;
    username: string;
    isAdmin: boolean;
}

@Injectable()
export class LocalSerializer extends PassportSerializer {

    private static now = () => new Date();

    constructor(
        @InjectRepository(Member)
        private memberRepository: Repository<Member>,
    ) {
        super();
    }

    serializeUser({ username, id, isAdmin }: Member, done: CallableFunction) {
        const user: SerializedUserData = { id, isAdmin, username }
        done(null, user);
    }

    async deserializeUser(user: SerializedUserData, done: CallableFunction) {
        const member = await this.memberRepository
            .findOneOrFail({ id: user.id })
            .catch(error => done(error));

        member.lastSeen = LocalSerializer.now();
        await this.memberRepository.save(member);

        done(null, user);
    }

}