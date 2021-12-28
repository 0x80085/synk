import * as bcrypt from 'bcrypt';

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VALIDPASS_RGX } from 'src/auth/services/auth.service';
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

    async changePassword(id: string, oldPassword: string, newPassword: string) {
        
        const trimmedOldPassword = oldPassword.trim();
        const trimmedNewPassword = newPassword.trim();

        const member = await this.memberRepository.findOneOrFail({ where: { id } });
        const equalsOldPassword = await bcrypt.compare(trimmedOldPassword, member.passwordHash);

        if (!equalsOldPassword) {
            throw new BadRequestException("Invalid old password");
        }
        
        if (!VALIDPASS_RGX.test(trimmedNewPassword)) {
            throw new BadRequestException("Invalid new password");
        }

        const hashedNewPassword = await bcrypt.hash(trimmedNewPassword, 10);
        member.passwordHash = hashedNewPassword;

        await this.memberRepository.save(member)

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
