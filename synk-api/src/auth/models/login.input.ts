import { ApiProperty } from '@nestjs/swagger';

export class LoginInput {

    @ApiProperty()
    username: string;

    @ApiProperty()
    password: string;
}
