import { BadRequestException, ForbiddenException, HttpService } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { of } from "rxjs";
import { catchError, map, switchMap, tap } from "rxjs/operators";

import { YouTubeGetID, YoutubeV3Service } from "src/tv/crawlers/youtube-v3.service";
import { MessageTypes } from "../gateways/message-types.enum";
import { AddMediaToRoomCommand } from "../models/commands/add-media-to-room.command";
import { Media } from "../models/media/media";
import { toRepresentation } from "../models/playlist/playlist.representation";
import { Room } from "../models/room/room";
import { allowedMediaSourceHosts } from "./allowed-media-hosts";

@CommandHandler(AddMediaToRoomCommand)
export class AddMediaToRoomHandler implements ICommandHandler<AddMediaToRoomCommand> {
    constructor(private ytService: YoutubeV3Service, private httpService: HttpService) { }

    async execute({ url, room, member, socket, socketServer }: AddMediaToRoomCommand) {

        try {
            if (allowedMediaSourceHosts.indexOf(new URL(url).host) === -1) {
                console.log("Host not allowed");
                throw new Error("Host not allowed");
            }

            const ytVideoId = YouTubeGetID(url)

            return of({ room, ytVideoId }).pipe(
                switchMap(({ room, ytVideoId }) =>
                    !Boolean(ytVideoId)
                        ? this.getMetadataFromElsewhere(url).pipe(map(media => ({ media, room })))
                        : this.getMetadataFromYoutubeApi(ytVideoId).pipe(map(media => ({ media, room })))
                ),
                tap(({ room, media }) => room.addMediaToPlaylist(member, media)),
                tap(() => this.broadcastPlaylistToRoom(room, socketServer)),
                tap(_ => socket.emit(MessageTypes.ADD_MEDIA_REQUEST_APPROVED, { url, playlistCount: room.currentPlaylist.queue.length })),
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
            map(({ url, title, duration }) => new Media(url, title, duration)),
            catchError((e) => {
                console.log(e);
                throw new Error("AddMediaException");
            }))
    }

    private getMetadataFromElsewhere(url: string) {
        if (url.endsWith('.mp4')) {
            return this.httpService.get(url).pipe(
                tap(res => console.log(res)),
                switchMap(res => {
                    if (res.headers.get('content-type') === "video/mp4" || res.headers.get('mime-type') === "video/mp4") {
                        console.log(res.headers.get('content-type'));
                        console.log(res.headers.get('mime-type'));
                        // somehow get metadata duration title etc
                        return of(new Media(url, "no title was given", 100));
                    }
                })
            )
        }

        return of(new Media(url, "no title was given", 100));
    }

    private broadcastPlaylistToRoom(room: Room, server: SocketIO.Server) {
        const playlist = toRepresentation(room.currentPlaylist);
        server.in(room.id).emit(MessageTypes.PLAYLIST_UPDATE, playlist);
    }
}