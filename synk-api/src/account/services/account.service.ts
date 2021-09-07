import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from 'src/domain/entity';
import { Repository } from 'typeorm';

import { UpdateAccountInput } from '../models/update-account.input';

@Injectable()
export class AccountService {


    constructor(
        @InjectRepository(Member)
        private memberRepository: Repository<Member>,
    ) { }

    async updateAccount(id: string, { avatarUrl, name }: UpdateAccountInput) {
        const member = await this.memberRepository.findOneOrFail({ where: { id } });
        member.username = name;
        member.avatarUrl = avatarUrl;

        await this.memberRepository.save(member)

        return member
    }

    getMemberAccount(id: string) {
        return this.memberRepository.findOneOrFail({ where: { id } })
            .then(member => {
                 delete member.passwordHash;
                 return member;
             });
    }

    async deleteAccount(id: string) {
        const member = await this.memberRepository.findOneOrFail({ where: { id } });
        await this.memberRepository.remove(member);
    }
}
