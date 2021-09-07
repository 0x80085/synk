import { ApiProperty } from '@nestjs/swagger';


export class UpdateChannelInput {
    @ApiProperty()
    description: string;
    
    @ApiProperty()
    isPublic: boolean;

    @ApiProperty()
    maxUsers: number;

    @ApiProperty()
    password: string;
}