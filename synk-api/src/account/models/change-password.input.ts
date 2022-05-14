import { ApiProperty } from "@nestjs/swagger";

export class ChangePasswordInput {
    @ApiProperty()
    oldPassword: string;

    @ApiProperty()
    newPassword: string;
}