import { ICommandHandler } from "@nestjs/cqrs";
import { CommandHandler } from "@nestjs/cqrs/dist/decorators/command-handler.decorator";
import { GetYtMetadataForUrlCommand } from "../../chat/models/commands/get-yt-metadata-for-url.command";
import { YouTubeGetID, YoutubeV3Service } from "../crawlers/youtube-v3.service";

@CommandHandler(GetYtMetadataForUrlCommand)
export class GetYtMetadataForUrl implements ICommandHandler<GetYtMetadataForUrlCommand> {
    constructor(private ytApi: YoutubeV3Service) { }

    async execute({ url }: GetYtMetadataForUrlCommand) {
        const id = YouTubeGetID(url);
        return this.ytApi.getVideoMetaData(id);
    }
}