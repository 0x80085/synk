import { ApiProperty } from "@nestjs/swagger";

export class GetYtMetadataForUrlCommand {
    @ApiProperty()
    url: string
}