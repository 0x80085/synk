import { BadRequestException, ForbiddenException, Logger, UnsupportedMediaTypeException, } from "@nestjs/common";
import { HttpService } from '@nestjs/axios';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { of, throwError } from "rxjs";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { Server } from 'socket.io';

import { YouTubeGetID, MediaMetaDataService } from "src/tv/crawlers/media-metadata.service";
import { MessageTypes } from "../gateways/message-types.enum";
import { AddMediaToRoomCommand } from "../models/commands/add-media-to-room.command";
import { Media } from "../models/media/media";
import { toRepresentation } from "../models/playlist/playlist.representation";
import { Room } from "../models/room/room";
import { GlobalSettingsService } from "src/settings/global-settings.service";

@CommandHandler(AddMediaToRoomCommand)
export class AddMediaToRoomHandler implements ICommandHandler<AddMediaToRoomCommand> {

    private logger = new Logger(AddMediaToRoomHandler.name);

    constructor(
        private ytService: MediaMetaDataService,
        private httpService: HttpService,
        private globalSettingsService: GlobalSettingsService
        // @InjectRepository(Channel)
        // private channelRepository: Repository<Channel>,
        // @InjectRepository(Video)
        // private videoRepository: Repository<Video>,
    ) { }

    async execute({ url, room, member, socket, socketServer }: AddMediaToRoomCommand) {

        try {
            const trimmedUrl = url.trim();

            if (!this.isMediaSourceSupported(trimmedUrl)) {
                console.log("Host not allowed");
                throw new BadRequestException("Host not allowed");
            }

            const ytVideoId = YouTubeGetID(trimmedUrl)

            return of({ room, ytVideoId }).pipe(
                switchMap(({ room, ytVideoId }) =>
                    !Boolean(ytVideoId)
                        ? this.getMetadataFromElsewhere(trimmedUrl).pipe(map(media => ({ media, room })))
                        : this.getMetadataFromInvidousApi(ytVideoId).pipe(map(media => ({ media, room })))
                ),
                tap(({ room, media }) => room.addMediaToPlaylist(member, media)),
                // tap(async ({ room, media }) => {
                //     const channel = await this.channelRepository.createQueryBuilder("channel")
                //         .leftJoinAndSelect("channel.activePlaylist", "activePlaylist")
                //         .leftJoinAndSelect("activePlaylist.videos", "videos")
                //         .where("channel.id = :channelId", { channelId: room.id })
                //         .getOneOrFail();

                //     this.videoRepository.create({
                //         playlist: channel.activePlaylist,
                //         dateAdded: new Date(),
                //         addedBy: member,
                //         positionInList: channel.activePlaylist.videos.length,
                //         url: media.url
                //     })
                // }),
                tap(() => this.broadcastPlaylistToRoom(room, socketServer)),
                tap(_ => socket.emit(MessageTypes.ADD_MEDIA_REQUEST_APPROVED, { url: trimmedUrl, playlistCount: room.currentPlaylist.queue.length })),
                catchError(e => {
                    if (e.message === 'Unauthorized') { throw new ForbiddenException(); }
                    console.log('AddMediaException');
                    console.log(e);

                    throw new Error("AddMediaException");
                })
            ).toPromise();

        } catch (error) {
            console.log(error);
            console.log(error.message);
            throw new Error("AddMediaException");
        }
    }

    private getMetadataFromInvidousApi(id: string) {
        return this.ytService.getVideoMetaDataWithRetry(id).pipe(
            map((data) => ({ url: `https://www.youtube.com/watch?v=${id}`, ...data })),
            map(({ url, title, duration, isLive }) => new Media(url, title, duration, isLive)),
            catchError((e) => {
                this.logger.error(`Failed to get YT data for ${id}`, e);
                throw new Error("AddMediaException");
            }))
    }

    private getMetadataFromElsewhere(url: string) {
        const hostName = new URL(url).host;
        if (
            hostName === 'www.twitch.tv' ||
            hostName === 'twitch.tv' ||
            hostName === 'www.vimeo.com' ||
            hostName === 'vimeo.com'
        ) {
            return of(new Media(url, url, 100));
        }

        return this.httpService.get(url, { headers: { 'Range': 'bytes=0-512' } })
            .pipe(
                switchMap(res =>
                    of(res).pipe(
                        map(res => res.headers),
                        tap(console.log),
                        map(headers => headers["content-type"]),
                        tap(console.log),
                        map(contentType => this.isSupportedMediaType(contentType)),
                        switchMap(isSupported => isSupported
                            ? of(res)
                            : throwError(() => new UnsupportedMediaTypeException(url + " is not an acceptable media type"))),
                        map(_ => {

                            const HEADER_FLAG = Buffer.from("mvhd");

                            const buffer = Buffer.from(res.data, "binary");

                            const start = buffer.indexOf(HEADER_FLAG) + 17;
                            const timeScale = buffer.readUInt32BE(start);
                            const duration = buffer.readUInt32BE(start + 4);
                            const movieLength = Math.floor(duration / timeScale);


                            return new Media(url, `Custom Media [${url}]`, movieLength);
                        }),
                        catchError(_ => of(new Media(url, `Custom Media [${url}]`, 0)))
                    ),
                ))
    }

    private isSupportedMediaType(contentType: any): boolean {
        return contentType === "video/mp4"
            || contentType === "video/webm"
            || contentType === "video/ogg";
    }

    private broadcastPlaylistToRoom(room: Room, server: Server) {
        const playlist = toRepresentation(room.currentPlaylist);
        server.in(room.id).emit(MessageTypes.PLAYLIST_UPDATE, playlist);
    }

    private isMediaSourceSupported(url: string) {
        const getDomain = (url: string) => {
            const regexParse = /([a-z0-9]{2,63})\.([a-z\.]{2,5})$/i;
            const urlParts = regexParse.exec(new URL(url).hostname);
            const [domain] = urlParts
            return domain;
        }

        try {
            const domain = getDomain(url)
            console.log(domain);
            return this.globalSettingsService.allowedMediaHostingProviders.indexOf(domain) != -1;
        } catch (error) {
            return false
        }
    }
}