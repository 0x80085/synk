import { ApiProperty } from '@nestjs/swagger';


export class CreateChannelInput {
    @ApiProperty()
    name: string;

    @ApiProperty()
    description: string;
    
    @ApiProperty()
    isPublic: boolean;

    @ApiProperty()
    maxUsers: number;

    @ApiProperty()
    password: string;
}
