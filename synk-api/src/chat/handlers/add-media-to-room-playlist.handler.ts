import { BadRequestException, ForbiddenException, } from "@nestjs/common";
import { HttpService } from '@nestjs/axios';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { of } from "rxjs";
import { catchError, map, mapTo, switchMap, tap } from "rxjs/operators";
import { Server } from 'socket.io';

import { YouTubeGetID, YoutubeV3Service } from "src/tv/crawlers/youtube-v3.service";
import { MessageTypes } from "../gateways/message-types.enum";
import { AddMediaToRoomCommand } from "../models/commands/add-media-to-room.command";
import { Media } from "../models/media/media";
import { toRepresentation } from "../models/playlist/playlist.representation";
import { Room } from "../models/room/room";
import { allowedMediaSourceHosts as supportedMediaSourceHosts } from "./allowed-media-hosts";

@CommandHandler(AddMediaToRoomCommand)
export class AddMediaToRoomHandler implements ICommandHandler<AddMediaToRoomCommand> {
    constructor(
        private ytService: YoutubeV3Service,
        private httpService: HttpService,
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
                        : this.getMetadataFromYoutubeApi(ytVideoId).pipe(map(media => ({ media, room })))
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

    private getMetadataFromYoutubeApi(id: string) {
        return this.ytService.getVideoMetaData(id).pipe(
            map((data) => ({ url: `https://www.youtube.com/watch?v=${id}`, ...data })),
            map(({ url, title, duration, isLive }) => new Media(url, title, duration, isLive)),
            catchError((e) => {
                console.log(e);
                throw new Error("AddMediaException");
            }))
    }

    private getMetadataFromElsewhere(url: string) {
        // if (url.endsWith('.mp4')) {

        // Maybe ffmpeg/node-ffprobe can be used to get metadata 

        // return this.httpService.get(url).pipe(
        //     tap(res => console.log(res)),
        //     switchMap(res => {
        //         if (res.headers.get('content-type') === "video/mp4" || res.headers.get('mime-type') === "video/mp4") {
        //             console.log(res.headers.get('content-type'));
        //             console.log(res.headers.get('mime-type'));
        //             // somehow get metadata duration title etc
        //             return of(new Media(url, "no title was given", 100));
        //         }
        //     })
        // )

        if (new URL(url).host === 'www.twitch.tv' || new URL(url).host === 'twitch.tv') {
            return of(new Media(url, url, 100));
        }

        // Do request only to check media type is smth playable
        return this.httpService.get(url, { headers: { 'Range': 'bytes=0-16' } })
            .pipe(
                map(res => res.headers),
                tap(console.log),
                map(headers => headers["content-type"]),
                tap(console.log),
                map(contentType => this.isSupportedMediaType(contentType)),
                mapTo(new Media(url, "no title was given", 0))
            )


        // }

        return of(new Media(url, "no title was given", 100));
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
            const regexParse = new RegExp('([a-z\-0-9]{2,63})\.([a-z\.]{2,5})$');
            const urlParts = regexParse.exec(new URL(url).hostname);
            const [domain] = urlParts
            return domain;
        }

        try {
            const domain = getDomain(url)
            console.log(domain);
            return supportedMediaSourceHosts.indexOf(domain) != -1;
        } catch (error) {
            return false
        }
    }
}