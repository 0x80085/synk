import { ApiProperty } from "@nestjs/swagger";

export class UpdateAccountInput {
    @ApiProperty()
    name: string;

    @ApiProperty()
    avatarUrl: string;
}