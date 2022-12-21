import { ICommandHandler } from "@nestjs/cqrs";
import { CommandHandler } from "@nestjs/cqrs/dist/decorators/command-handler.decorator";
import { GetYtMetadataForUrlCommand } from "../../chat/models/commands/get-yt-metadata-for-url.command";
import { YouTubeGetID, MediaMetaDataService } from "../crawlers/media-metadata.service";

@CommandHandler(GetYtMetadataForUrlCommand)
export class GetYtMetadataForUrl implements ICommandHandler<GetYtMetadataForUrlCommand> {
    constructor(private metadataService: MediaMetaDataService) { }

    async execute({ url }: GetYtMetadataForUrlCommand) {
        const id = YouTubeGetID(url);
        return this.metadataService.getVideoMetaDataWithRetry(id);
    }
}